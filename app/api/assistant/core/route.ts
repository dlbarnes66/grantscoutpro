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
    const { workspaceId, message } = await req.json();

    if (!workspaceId || !message) {
      return NextResponse.json(
        { error: "workspaceId and message are required" },
        { status: 400 }
      );
    }

    // Fetch workspace profile
    const { data: profile } = await supabase
      .from("workspace_profiles")
      .select("*")
      .eq("workspace_id", workspaceId)
      .single();

    // Fetch project profile
    const { data: project } = await supabase
      .from("workspace_projects")
      .select("*")
      .eq("workspace_id", workspaceId)
      .single();

    // Fetch unified GrantRadar feed
    const { data: radar } = await supabase
      .from("grantradar_unified")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("id", { ascending: false })
      .limit(1)
      .single();

    // Fetch unified alerts
    const { data: alerts } = await supabase
      .from("alerts_unified")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("id", { ascending: false })
      .limit(1)
      .single();

    const prompt = `
You are the GrantRadar AI Assistant. You understand grants, intelligence signals, rankings, alerts, deadlines, risks, opportunities, and strategy.

User Message:
${message}

Workspace Profile:
${JSON.stringify(profile, null, 2)}

Project Profile:
${JSON.stringify(project, null, 2)}

Unified GrantRadar Feed:
${JSON.stringify(radar?.unified_feed || [], null, 2)}

Unified Alerts:
${JSON.stringify(alerts?.unified_alerts || [], null, 2)}

Respond conversationally, clearly, and helpfully.

Provide a JSON response:
{
  "reply": string,
  "contextUsed": string[],
  "suggestedFollowUps": string[]
}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    await supabase.from("assistant_history").insert({
      workspace_id: workspaceId,
      user_message: message,
      assistant_reply: result.reply,
      context_used: result.contextUsed,
      suggested_followups: result.suggestedFollowUps,
    });

    return NextResponse.json({
      success: true,
      reply: result.reply,
      contextUsed: result.contextUsed,
      suggestedFollowUps: result.suggestedFollowUps,
    });
  } catch (err: any) {
    console.error("Assistant core error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
