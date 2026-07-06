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

    // Fetch grant structured data
    const { data: grant, error: grantError } = await supabase
      .from("structured_grants")
      .select("*")
      .eq("id", grantId)
      .single();

    if (grantError || !grant) {
      return NextResponse.json(
        { error: "Grant not found" },
        { status: 404 }
      );
    }

    // Fetch workspace profile
    const { data: profile, error: profileError } = await supabase
      .from("workspace_profiles")
      .select("*")
      .eq("workspace_id", workspaceId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Workspace profile not found" },
        { status: 404 }
      );
    }

    // Fetch previously generated intelligence (optional but powerful)
    const { data: score } = await supabase
      .from("grant_scores")
      .select("score, reasoning")
      .eq("workspace_id", workspaceId)
      .eq("grant_id", grantId)
      .single();

    const { data: confidence } = await supabase
      .from("grant_match_confidence")
      .select("confidence, summary")
      .eq("workspace_id", workspaceId)
      .eq("grant_id", grantId)
      .single();

    const { data: eligibility } = await supabase
      .from("grant_eligibility")
      .select("eligible, eligibility_score, unmet_requirements")
      .eq("workspace_id", workspaceId)
      .eq("grant_id", grantId)
      .single();

    const { data: risks } = await supabase
      .from("grant_risk_flags")
      .select("risk_level, major_risks, compliance_issues")
      .eq("workspace_id", workspaceId)
      .eq("grant_id", grantId)
      .single();

    const { data: insights } = await supabase
      .from("grant_opportunity_insights")
      .select("key_advantages, strategic_angles, recommended_focus_areas")
      .eq("workspace_id", workspaceId)
      .eq("grant_id", grantId)
      .single();

    // AI prompt
    const prompt = `
You are an expert grant strategist. Based on the workspace profile, grant details, and previously generated intelligence, provide strategic recommendations for maximizing the chance of winning this grant.

Workspace Profile:
${JSON.stringify(profile, null, 2)}

Grant Details:
${JSON.stringify(grant, null, 2)}

Existing Intelligence:
Score: ${JSON.stringify(score, null, 2)}
Match Confidence: ${JSON.stringify(confidence, null, 2)}
Eligibility: ${JSON.stringify(eligibility, null, 2)}
Risks: ${JSON.stringify(risks, null, 2)}
Opportunity Insights: ${JSON.stringify(insights, null, 2)}

Provide a JSON response with:
{
  "overallStrategy": string,
  "keyActions": string[],
  "applicationFocusAreas": string[],
  "riskMitigationSteps": string[],
  "strengthAmplification": string[],
  "finalRecommendationSummary": string
}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.25,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    // Save strategic recommendations
    await supabase.from("grant_strategic_recommendations").insert({
      workspace_id: workspaceId,
      grant_id: grantId,
      overall_strategy: result.overallStrategy,
      key_actions: result.keyActions,
      application_focus_areas: result.applicationFocusAreas,
      risk_mitigation_steps: result.riskMitigationSteps,
      strength_amplification: result.strengthAmplification,
      final_summary: result.finalRecommendationSummary,
    });

    return NextResponse.json({
      success: true,
      overallStrategy: result.overallStrategy,
      keyActions: result.keyActions,
      applicationFocusAreas: result.applicationFocusAreas,
      riskMitigationSteps: result.riskMitigationSteps,
      strengthAmplification: result.strengthAmplification,
      finalRecommendationSummary: result.finalRecommendationSummary,
    });
  } catch (err: any) {
    console.error("AI strategic recommendation error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
