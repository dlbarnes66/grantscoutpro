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
    const { workspaceId, grantId, type } = await req.json();

    if (!workspaceId || !grantId || !type) {
      return NextResponse.json(
        { error: "workspaceId, grantId, and type are required" },
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

    // Fetch structured grant (federal or state)
    const table = type === "federal" ? "structured_grants" : "state_structured_grants";
    const { data: grant } = await supabase
      .from(table)
      .select("*")
      .eq("id", grantId)
      .single();

    // Fetch intelligence
    const intelTable = type === "federal" ? "grant_intelligence" : "state_intelligence";
    const { data: intelligence } = await supabase
      .from(intelTable)
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq(type === "federal" ? "grant_id" : "state_grant_id", grantId)
      .single();

    // Fetch insights
    const insightsTable = type === "federal" ? "grant_insights" : "state_insights";
    const { data: insights } = await supabase
      .from(insightsTable)
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq(type === "federal" ? "grant_id" : "state_grant_id", grantId)
      .single();

    const prompt = `
You are the GrantRadar AI Assistant. Explain this grant clearly and conversationally.

Workspace Profile:
${JSON.stringify(profile, null, 2)}

Project Profile:
${JSON.stringify(project, null, 2)}

Grant:
${JSON.stringify(grant, null, 2)}

Intelligence:
${JSON.stringify(intelligence, null, 2)}

Insights:
${JSON.stringify(insights, null, 2)}

Provide a JSON response:
{
  "explanation": string,
  "eligibilitySummary": string,
  "opportunitySummary": string,
  "riskSummary": string,
  "shouldApply": string,
  "suggestedFollowUps": string[]
}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.35,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    await supabase.from("assistant_explanations").insert({
      workspace_id: workspaceId,
      grant_id: grantId,
      type,
      explanation: result.explanation,
      eligibility_summary: result.eligibilitySummary,
      opportunity_summary: result.opportunitySummary,
      risk_summary: result.riskSummary,
      should_apply: result.shouldApply,
      suggested_followups: result.suggestedFollowUps,
    });

    return NextResponse.json({
      success: true,
      explanation: result.explanation,
      eligibilitySummary: result.eligibilitySummary,
      opportunitySummary: result.opportunitySummary,
      riskSummary: result.riskSummary,
      shouldApply: result.shouldApply,
      suggestedFollowUps: result.suggestedFollowUps,
    });
  } catch (err: any) {
    console.error("Grant explanation error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
