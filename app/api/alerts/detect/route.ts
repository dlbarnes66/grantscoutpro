import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { workspaceId } = await req.json();

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    // Fetch alert rules
    const { data: rules } = await supabase
      .from("alert_rules")
      .select("*")
      .eq("workspace_id", workspaceId)
      .single();

    // Fetch federal intelligence
    const { data: federalIntel } = await supabase
      .from("grant_intelligence")
      .select("*")
      .eq("workspace_id", workspaceId);

    // Fetch state intelligence
    const { data: stateIntel } = await supabase
      .from("state_intelligence")
      .select("*")
      .eq("workspace_id", workspaceId);

    // Fetch federal insights
    const { data: federalInsights } = await supabase
      .from("grant_insights")
      .select("*")
      .eq("workspace_id", workspaceId);

    // Fetch state insights
    const { data: stateInsights } = await supabase
      .from("state_insights")
      .select("*")
      .eq("workspace_id", workspaceId);

    const prompt = `
You are an expert grant change detection engine. Compare current intelligence and insights against alert rules to detect changes.

Alert Rules:
${JSON.stringify(rules?.rules || {}, null, 2)}

Federal Intelligence:
${JSON.stringify(federalIntel || [], null, 2)}

State Intelligence:
${JSON.stringify(stateIntel || [], null, 2)}

Federal Insights:
${JSON.stringify(federalInsights || [], null, 2)}

State Insights:
${JSON.stringify(stateInsights || [], null, 2)}

Provide a JSON response:
{
  "detectedChanges": [
    {
      "type": "federal" | "state",
      "grantId": number,
      "changeType": string,
      "oldValue": string | number | boolean | null,
      "newValue": string | number | boolean | null,
      "severity": "low" | "medium" | "high",
      "notes": string
    }
  ],
  "detectionSummary": string
}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    await supabase.from("alert_detections").insert({
      workspace_id: workspaceId,
      detected_changes: result.detectedChanges,
      detection_summary: result.detectionSummary,
    });

    return NextResponse.json({
      success: true,
      detectedChanges: result.detectedChanges,
      detectionSummary: result.detectionSummary,
    });
  } catch (err: any) {
    console.error("Alert detection error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

