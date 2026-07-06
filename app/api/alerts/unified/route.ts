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

    // Fetch federal alerts
    const { data: federalAlerts } = await supabase
      .from("alerts_generated")
      .select("*")
      .eq("workspace_id", workspaceId);

    // Fetch state alerts
    const { data: stateAlerts } = await supabase
      .from("alerts_generated_state")
      .select("*")
      .eq("workspace_id", workspaceId);

    const prompt = `
You are an expert grant alerts aggregator. Combine federal and state alerts into a unified feed.

Federal Alerts:
${JSON.stringify(federalAlerts || [], null, 2)}

State Alerts:
${JSON.stringify(stateAlerts || [], null, 2)}

Provide a JSON response:
{
  "unifiedAlerts": [
    {
      "type": "federal" | "state",
      "grantId": number,
      "alertType": string,
      "severity": "low" | "medium" | "high",
      "message": string,
      "recommendedAction": string,
      "timestamp": string
    }
  ],
  "feedSummary": string,
  "recommendations": string[]
}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    await supabase.from("alerts_unified").insert({
      workspace_id: workspaceId,
      unified_alerts: result.unifiedAlerts,
      feed_summary: result.feedSummary,
      recommendations: result.recommendations,
    });

    return NextResponse.json({
      success: true,
      unifiedAlerts: result.unifiedAlerts,
      feedSummary: result.feedSummary,
      recommendations: result.recommendations,
    });
  } catch (err: any) {
    console.error("Unified alerts error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
