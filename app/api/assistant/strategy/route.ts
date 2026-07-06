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
    const { workspaceId, question } = await req.json();

    if (!workspaceId || !question) {
      return NextResponse.json(
        { error: "workspaceId and question are required" },
        { status: 400 }
      );
    }

    // Workspace profile
    const { data: profile } = await supabase
      .from("workspace_profiles")
      .select("*")
      .eq("workspace_id", workspaceId)
      .single();

    // Project profile
    const { data: project } = await supabase
      .from("workspace_projects")
      .select("*")
      .eq("workspace_id", workspaceId)
      .single();

    // Unified GrantRadar feed
    const { data: radar } = await supabase
      .from("grantradar_unified")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("id", { ascending: false })
      .limit(1)
      .single();

    // Unified alerts
    const { data: alerts } = await supabase
      .from("alerts_unified")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("id", { ascending: false })
      .limit(1)
      .single();

    const prompt = `
You are the GrantRadar AI Strategy Engine. Provide strategic guidance based on:

User Question:
${question}

Workspace Profile:
${JSON.stringify(profile, null, 2)}

Project Profile:
${JSON.stringify(project, null, 2)}

Unified GrantRadar Feed:
${JSON.stringify(radar?.unified_feed || [], null, 2)}

Unified Alerts:
${JSON.stringify(alerts?.unified_alerts || [], null, 2)}

Provide a JSON response:
{
  "strategy": string,
  "recommendedActions": string[],
  "priorityGrants": string[],
  "risksToWatch": string[],
  "opportunitiesToLeverage": string[],
  "suggestedFollowUps": string[]
}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.35,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    await supabase.from("assistant_strategy").insert({
      workspace_id: workspaceId,
      question,
      strategy: result.strategy,
      recommended_actions: result.recommendedActions,
      priority_grants: result.priorityGrants,
      risks_to_watch: result.risksToWatch,
      opportunities_to_leverage: result.opportunitiesToLeverage,
      suggested_followups: result.suggestedFollowUps,
    });

    return NextResponse.json({
      success: true,
      strategy: result.strategy,
      recommendedActions: result.recommendedActions,
      priorityGrants: result.priorityGrants,
      risksToWatch: result.risksToWatch,
      opportunitiesToLeverage: result.opportunitiesToLeverage,
      suggestedFollowUps: result.suggestedFollowUps,
    });
  } catch (err: any) {
    console.error("Strategy engine error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
