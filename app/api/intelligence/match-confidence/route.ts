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
You are an expert grant evaluator. Analyze the match confidence between this workspace and this grant.

Workspace Profile:
${JSON.stringify(profile, null, 2)}

Grant Details:
${JSON.stringify(grant, null, 2)}

Provide a JSON response with:
{
  "confidence": number (0-100),
  "summary": string,
  "alignmentFactors": string[],
  "misalignmentFactors": string[]
}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    // Save match confidence
    await supabase.from("grant_match_confidence").insert({
      workspace_id: workspaceId,
      grant_id: grantId,
      confidence: result.confidence,
      summary: result.summary,
      alignment_factors: result.alignmentFactors,
      misalignment_factors: result.misalignmentFactors,
    });

    return NextResponse.json({
      success: true,
      confidence: result.confidence,
      summary: result.summary,
      alignmentFactors: result.alignmentFactors,
      misalignmentFactors: result.misalignmentFactors,
    });
  } catch (err: any) {
    console.error("AI match confidence error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
