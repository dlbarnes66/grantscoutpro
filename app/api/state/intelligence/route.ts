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
    const { workspaceId, stateGrantId } = await req.json();

    if (!workspaceId || !stateGrantId) {
      return NextResponse.json(
        { error: "workspaceId and stateGrantId are required" },
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

    // Fetch structured state grant
    const { data: grant } = await supabase
      .from("state_structured_grants")
      .select("*")
      .eq("id", stateGrantId)
      .single();

    const prompt = `
You are an expert state-level grant intelligence engine. Analyze the workspace, project, and state grant to produce intelligence scoring.

Workspace Profile:
${JSON.stringify(profile, null, 2)}

Project Profile:
${JSON.stringify(project, null, 2)}

State Grant:
${JSON.stringify(grant, null, 2)}

Provide a JSON response:
{
  "score": number,
  "matchConfidence": number,
  "eligibility": {
    "eligible": boolean,
    "reasons": string[]
  },
  "alignmentNotes": string[],
  "intelligenceSummary": string
}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.25,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    await supabase.from("state_intelligence").insert({
      workspace_id: workspaceId,
      state_grant_id: stateGrantId,
      score: result.score,
      match_confidence: result.matchConfidence,
      eligibility: result.eligibility,
      alignment_notes: result.alignmentNotes,
      intelligence_summary: result.intelligenceSummary,
    });

    return NextResponse.json({
      success: true,
      score: result.score,
      matchConfidence: result.matchConfidence,
      eligibility: result.eligibility,
      alignmentNotes: result.alignmentNotes,
      intelligenceSummary: result.intelligenceSummary,
    });
  } catch (err: any) {
    console.error("State intelligence error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
