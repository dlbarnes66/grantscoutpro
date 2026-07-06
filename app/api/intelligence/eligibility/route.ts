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
You are an expert grant eligibility analyst. Evaluate whether this workspace is eligible for this grant.

Workspace Profile:
${JSON.stringify(profile, null, 2)}

Grant Details:
${JSON.stringify(grant, null, 2)}

Provide a JSON response with:
{
  "eligible": boolean,
  "eligibilityScore": number (0-100),
  "metRequirements": string[],
  "unmetRequirements": string[],
  "notes": string
}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    // Save eligibility analysis
    await supabase.from("grant_eligibility").insert({
      workspace_id: workspaceId,
      grant_id: grantId,
      eligible: result.eligible,
      eligibility_score: result.eligibilityScore,
      met_requirements: result.metRequirements,
      unmet_requirements: result.unmetRequirements,
      notes: result.notes,
    });

    return NextResponse.json({
      success: true,
      eligible: result.eligible,
      eligibilityScore: result.eligibilityScore,
      metRequirements: result.metRequirements,
      unmetRequirements: result.unmetRequirements,
      notes: result.notes,
    });
  } catch (err: any) {
    console.error("AI eligibility analysis error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
