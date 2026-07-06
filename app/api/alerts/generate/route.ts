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

    // Fetch detected changes
    const { data: detections } = await supabase
      .from("alert_detections")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("id", { ascending: false })
      .limit(1)
      .single();

    const prompt = `
You are an expert grant alert generation engine. Convert detected changes into actionable alerts using workspace alert rules.

Alert Rules:
${JSON.stringify(rules?.rules || {}, null, 2)}

Detected Changes:
${JSON.stringify(detections?.detected_changes || [], null, 2)}

Provide a JSON response:
{
  "alerts": [
    {
      "type": "federal" | "state",
      "grantId": number,
      "alertType": string,
      "severity": "low" | "medium" | "high",
      "message": string,
      "recommendedAction": string
    }
  ],
  "alertSummary": string
}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    await supabase.from("alerts_generated").insert({
      workspace_id: workspaceId,
      alerts: result.alerts,
      alert_summary: result.alertSummary,
    });

    return NextResponse.json({
      success: true,
      alerts: result.alerts,
      alertSummary: result.alertSummary,
    });
  } catch (err: any) {
    console.error("Alert generation error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
