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

    // AI prompt
    const prompt = `
You are an expert grant reviewer. Identify potential risks, compliance issues, and red flags that could affect this workspace's ability to win this grant.

Workspace Profile:
${JSON.stringify(profile, null, 2)}

Grant Details:
${JSON.stringify(grant, null, 2)}

Provide a JSON response with:
{
  "riskLevel": "low" | "medium" | "high",
  "riskScore": number (0-100),
  "majorRisks": string[],
  "minorRisks": string[],
  "complianceIssues": string[],
  "recommendations": string
}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    // Save risk flags
    await supabase.from("grant_risk_flags").insert({
      workspace_id: workspaceId,
      grant_id: grantId,
      risk_level: result.riskLevel,
      risk_score: result.riskScore,
      major_risks: result.majorRisks,
      minor_risks: result.minorRisks,
      compliance_issues: result.complianceIssues,
      recommendations: result.recommendations,
    });

    return NextResponse.json({
      success: true,
      riskLevel: result.riskLevel,
      riskScore: result.riskScore,
      majorRisks: result.majorRisks,
      minorRisks: result.minorRisks,
      complianceIssues: result.complianceIssues,
      recommendations: result.recommendations,
    });
  } catch (err: any) {
    console.error("AI risk flag error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
