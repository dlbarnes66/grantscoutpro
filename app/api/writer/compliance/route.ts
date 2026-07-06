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
    const { data: eligibility } = await supabase
      .from("grant_eligibility")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("grant_id", grantId)
      .single();

    const { data: risks } = await supabase
      .from("grant_risk_flags")
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

    const prompt = `
You are an expert grant compliance reviewer. Analyze this workspace, project, and grant to produce compliance guidance.

Workspace Profile:
${JSON.stringify(profile, null, 2)}

Project Profile:
${JSON.stringify(project, null, 2)}

Grant Details:
${JSON.stringify(grant, null, 2)}

Eligibility:
${JSON.stringify(eligibility, null, 2)}

Risks:
${JSON.stringify(risks, null, 2)}

Opportunity Insights:
${JSON.stringify(insights, null, 2)}

Provide a JSON response:
{
  "complianceChecklist": string[],
  "requiredDocuments": string[],
  "formattingRules": string[],
  "disqualificationRisks": string[],
  "alignmentCorrections": string[],
  "finalComplianceSummary": string
}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.25,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    await supabase.from("grant_compliance").insert({
      workspace_id: workspaceId,
      grant_id: grantId,
      compliance_checklist: result.complianceChecklist,
      required_documents: result.requiredDocuments,
      formatting_rules: result.formattingRules,
      disqualification_risks: result.disqualificationRisks,
      alignment_corrections: result.alignmentCorrections,
      final_summary: result.finalComplianceSummary,
    });

    return NextResponse.json({
      success: true,
      complianceChecklist: result.complianceChecklist,
      requiredDocuments: result.requiredDocuments,
      formattingRules: result.formattingRules,
      disqualificationRisks: result.disqualificationRisks,
      alignmentCorrections: result.alignmentCorrections,
      finalComplianceSummary: result.finalComplianceSummary,
    });
  } catch (err: any) {
    console.error("Compliance writer error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
