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
You are an expert grant strategist. Analyze this grant and provide strategic opportunity insights for the workspace.

Workspace Profile:
${JSON.stringify(profile, null, 2)}

Grant Details:
${JSON.stringify(grant, null, 2)}

Provide a JSON response with:
{
  "opportunityStrength": number (0-100),
  "keyAdvantages": string[],
  "strategicAngles": string[],
  "recommendedFocusAreas": string[],
  "summary": string
}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.25,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    // Save insights
    await supabase.from("grant_opportunity_insights").insert({
      workspace_id: workspaceId,
      grant_id: grantId,
      opportunity_strength: result.opportunityStrength,
      key_advantages: result.keyAdvantages,
      strategic_angles: result.strategicAngles,
      recommended_focus_areas: result.recommendedFocusAreas,
      summary: result.summary,
    });

    return NextResponse.json({
      success: true,
      opportunityStrength: result.opportunityStrength,
      keyAdvantages: result.keyAdvantages,
      strategicAngles: result.strategicAngles,
      recommendedFocusAreas: result.recommendedFocusAreas,
      summary: result.summary,
    });
  } catch (err: any) {
    console.error("AI opportunity insights error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
