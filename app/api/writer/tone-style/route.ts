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
    const { workspaceId, grantId, draft, tone, styleSample } = await req.json();

    if (!workspaceId || !grantId || !draft || !tone) {
      return NextResponse.json(
        { error: "workspaceId, grantId, draft, and tone are required" },
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

    const prompt = `
You are an expert grant writer and tone-matching specialist. Rewrite the following draft in the requested tone and style.

Draft:
${draft}

Requested Tone:
${tone}

Style Sample (if provided):
${styleSample || "None provided"}

Workspace Profile:
${JSON.stringify(profile, null, 2)}

Project Profile:
${JSON.stringify(project, null, 2)}

Grant Details:
${JSON.stringify(grant, null, 2)}

Compliance Guidance:
${JSON.stringify(compliance, null, 2)}

Provide a JSON response:
{
  "rewrittenDraft": string,
  "toneCharacteristics": string[],
  "styleNotes": string[],
  "finalToneSummary": string
}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    await supabase.from("grant_tone_style").insert({
      workspace_id: workspaceId,
      grant_id: grantId,
      original_draft: draft,
      rewritten_draft: result.rewrittenDraft,
      tone_characteristics: result.toneCharacteristics,
      style_notes: result.styleNotes,
      final_tone_summary: result.finalToneSummary,
    });

    return NextResponse.json({
      success: true,
      rewrittenDraft: result.rewrittenDraft,
      toneCharacteristics: result.toneCharacteristics,
      styleNotes: result.styleNotes,
      finalToneSummary: result.finalToneSummary,
    });
  } catch (err: any) {
    console.error("Tone/style engine error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
