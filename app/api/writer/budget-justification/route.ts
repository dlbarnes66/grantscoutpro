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
    const { workspaceId, grantId, budget } = await req.json();

    if (!workspaceId || !grantId || !budget) {
      return NextResponse.json(
        { error: "workspaceId, grantId, and budget are required" },
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

    // Fetch compliance guidance
    const { data: compliance } = await supabase
      .from("grant_compliance")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("grant_id", grantId)
      .single();

    // Fetch strategic recommendations
    const { data: strategy } = await supabase
      .from("grant_strategic_recommendations")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("grant_id", grantId)
      .single();

    const prompt = `
You are an expert grant budget justification writer. Create a detailed, compliant, persuasive budget justification for this grant.

Workspace Profile:
${JSON.stringify(profile, null, 2)}

Project Profile:
${JSON.stringify(project, null, 2)}

Grant Details:
${JSON.stringify(grant, null, 2)}

Budget Line Items:
${JSON.stringify(budget, null, 2)}

Compliance Guidance:
${JSON.stringify(compliance, null, 2)}

Strategic Recommendations:
${JSON.stringify(strategy, null, 2)}

Provide a JSON response:
{
  "justificationNarrative": string,
  "lineItemBreakdown": { "item": string, "justification": string }[],
  "funderAlignmentNotes": string[],
  "riskMitigationNotes": string[],
  "finalBudgetSummary": string
}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    await supabase.from("grant_budget_justifications").insert({
      workspace_id: workspaceId,
      grant_id: grantId,
      justification_narrative: result.justificationNarrative,
      line_item_breakdown: result.lineItemBreakdown,
      funder_alignment_notes: result.funderAlignmentNotes,
      risk_mitigation_notes: result.riskMitigationNotes,
      final_budget_summary: result.finalBudgetSummary,
    });

    return NextResponse.json({
      success: true,
      justificationNarrative: result.justificationNarrative,
      lineItemBreakdown: result.lineItemBreakdown,
      funderAlignmentNotes: result.funderAlignmentNotes,
      riskMitigationNotes: result.riskMitigationNotes,
      finalBudgetSummary: result.finalBudgetSummary,
    });
  } catch (err: any) {
    console.error("Budget justification writer error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
