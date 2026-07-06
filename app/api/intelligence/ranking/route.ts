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
    const { workspaceId, grantId } = await req.json();

    if (!workspaceId || !grantId) {
      return NextResponse.json(
        { error: "workspaceId and grantId are required" },
        { status: 400 }
      );
    }

    // Fetch all intelligence components
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
      .select("risk_level, risk_score, major_risks")
      .eq("workspace_id", workspaceId)
      .eq("grant_id", grantId)
      .single();

    const { data: insights } = await supabase
      .from("grant_opportunity_insights")
      .select("opportunity_strength, key_advantages")
      .eq("workspace_id", workspaceId)
      .eq("grant_id", grantId)
      .single();

    const { data: strategy } = await supabase
      .from("grant_strategic_recommendations")
      .select("overall_strategy, key_actions")
      .eq("workspace_id", workspaceId)
      .eq("grant_id", grantId)
      .single();

    // AI prompt to unify ranking
    const prompt = `
You are an expert grant intelligence analyst. Combine all intelligence signals into a unified ranking score (0–100).

Inputs:
Score: ${JSON.stringify(score, null, 2)}
Match Confidence: ${JSON.stringify(confidence, null, 2)}
Eligibility: ${JSON.stringify(eligibility, null, 2)}
Risks: ${JSON.stringify(risks, null, 2)}
Opportunity Insights: ${JSON.stringify(insights, null, 2)}
Strategic Recommendations: ${JSON.stringify(strategy, null, 2)}

Provide a JSON response with:
{
  "unifiedScore": number (0-100),
  "priority": "low" | "medium" | "high" | "top",
  "reasoning": string,
  "recommendedNextSteps": string[]
}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    // Save unified ranking
    await supabase.from("grant_ranking").insert({
      workspace_id: workspaceId,
      grant_id: grantId,
      unified_score: result.unifiedScore,
      priority: result.priority,
      reasoning: result.reasoning,
      recommended_next_steps: result.recommendedNextSteps,
    });

    return NextResponse.json({
      success: true,
      unifiedScore: result.unifiedScore,
      priority: result.priority,
      reasoning: result.reasoning,
      recommendedNextSteps: result.recommendedNextSteps,
    });
  } catch (err: any) {
    console.error("Unified ranking error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
