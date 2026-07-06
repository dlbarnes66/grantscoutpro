import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

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
    const { workspaceId, grantId } = await req.json();

    if (!workspaceId || !grantId) {
      return NextResponse.json(
        { error: "workspaceId and grantId are required" },
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

    // Fetch grant structured data
    const { data: grant } = await supabase
      .from("structured_grants")
      .select("*")
      .eq("id", grantId)
      .single();

    // Fetch intelligence signals
    const { data: score } = await supabase
      .from("grant_scores")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("grant_id", grantId)
      .single();

    const { data: confidence } = await supabase
      .from("grant_match_confidence")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("grant_id", grantId)
      .single();

    const { data: eligibility } = await supabase
      .from("grant_eligibility")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("grant_id", grantId)
      .single();

    const { data: insights } = await supabase
      .from("grant_opportunity_insights")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("grant_id", grantId)
      .single();

    const { data: strategy } = await supabase
      .from("grant_strategic_recommendations")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("grant_id", grantId)
      .single();

    const prompt = `
You are an expert grant writer. Build a compelling narrative introduction for this grant application.

Workspace Profile:
${JSON.stringify(profile, null, 2)}

Project Profile:
${JSON.stringify(project, null, 2)}

Grant Details:
${JSON.stringify(grant, null, 2)}

Intelligence Signals:
Score: ${JSON.stringify(score, null, 2)}
Match Confidence: ${JSON.stringify(confidence, null, 2)}
Eligibility: ${JSON.stringify(eligibility, null, 2)}
Insights: ${JSON.stringify(insights, null, 2)}
Strategy: ${JSON.stringify(strategy, null, 2)}

Provide a JSON response:
{
  "narrative": string,
  "keyThemes": string[],
  "recommendedTone": string
}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.35,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    await supabase.from("grant_narratives").insert({
      workspace_id: workspaceId,
      grant_id: grantId,
      narrative: result.narrative,
      key_themes: result.keyThemes,
      recommended_tone: result.recommendedTone,
    });

    return NextResponse.json({
      success: true,
      narrative: result.narrative,
      keyThemes: result.keyThemes,
      recommendedTone: result.recommendedTone,
    });
  } catch (err: any) {
    console.error("Narrative builder error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
