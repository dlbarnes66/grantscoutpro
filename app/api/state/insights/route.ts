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
    const { workspaceId, stateGrantId } = await req.json();

    if (!workspaceId || !stateGrantId) {
      return NextResponse.json(
        { error: "workspaceId and stateGrantId are required" },
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

    // Fetch structured state grant
    const { data: grant } = await supabase
      .from("state_structured_grants")
      .select("*")
      .eq("id", stateGrantId)
      .single();

    // Fetch state intelligence (score + match + eligibility)
    const { data: intelligence } = await supabase
      .from("state_intelligence")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("state_grant_id", stateGrantId)
      .single();

    const prompt = `
You are an expert state-level grant insights engine. Analyze the workspace, project, structured grant, and intelligence signals to produce risk flags and opportunity insights.

Workspace Profile:
${JSON.stringify(profile, null, 2)}

Project Profile:
${JSON.stringify(project, null, 2)}

State Grant:
${JSON.stringify(grant, null, 2)}

Intelligence Signals:
${JSON.stringify(intelligence, null, 2)}

Provide a JSON response:
{
  "riskFlags": string[],
  "opportunityInsights": string[],
  "strengths": string[],
  "weaknesses": string[],
  "strategicRecommendations": string[],
  "insightsSummary": string
}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.25,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    await supabase.from("state_insights").insert({
      workspace_id: workspaceId,
      state_grant_id: stateGrantId,
      risk_flags: result.riskFlags,
      opportunity_insights: result.opportunityInsights,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      strategic_recommendations: result.strategicRecommendations,
      insights_summary: result.insightsSummary,
    });

    return NextResponse.json({
      success: true,
      riskFlags: result.riskFlags,
      opportunityInsights: result.opportunityInsights,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      strategicRecommendations: result.strategicRecommendations,
      insightsSummary: result.insightsSummary,
    });
  } catch (err: any) {
    console.error("State insights error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
