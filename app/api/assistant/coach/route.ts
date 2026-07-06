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
    const { workspaceId, grantId, type, draft } = await req.json();

    if (!workspaceId || !grantId || !type || !draft) {
      return NextResponse.json(
        { error: "workspaceId, grantId, type, and draft are required" },
        { status: 400 }
      );
    }

    // Workspace profile
    const { data: profile } = await supabase
      .from("workspace_profiles")
      .select("*")
      .eq("workspace_id", workspaceId)
      .single();

    // Project profile
    const { data: project } = await supabase
      .from("workspace_projects")
      .select("*")
      .eq("workspace_id", workspaceId)
      .single();

    // Structured grant
    const grantTable =
      type === "federal" ? "structured_grants" : "state_structured_grants";

    const { data: grant } = await supabase
      .from(grantTable)
      .select("*")
      .eq("id", grantId)
      .single();

    // Intelligence
    const intelTable =
      type === "federal" ? "grant_intelligence" : "state_intelligence";

    const { data: intelligence } = await supabase
      .from(intelTable)
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq(type === "federal" ? "grant_id" : "state_grant_id", grantId)
      .single();

    // Insights
    const insightsTable =
      type === "federal" ? "grant_insights" : "state_insights";

    const { data: insights } = await supabase
      .from(insightsTable)
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq(type === "federal" ? "grant_id" : "state_grant_id", grantId)
      .single();

    const prompt = `
You are the GrantRadar AI Proposal Coach. Improve the user's proposal draft using:

Workspace Profile:
${JSON.stringify(profile, null, 2)}

Project Profile:
${JSON.stringify(project, null, 2)}

Grant:
${JSON.stringify(grant, null, 2)}

Intelligence:
${JSON.stringify(intelligence, null, 2)}

Insights:
${JSON.stringify(insights, null, 2)}

User Draft:
${draft}

Provide a JSON response:
{
  "improvedDraft": string,
  "coachingNotes": string[],
  "strengths": string[],
  "weaknesses": string[],
  "alignmentImprovements": string[],
  "suggestedFollowUps": string[]
}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.35,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    await supabase.from("assistant_coaching").insert({
      workspace_id: workspaceId,
      grant_id: grantId,
      type,
      improved_draft: result.improvedDraft,
      coaching_notes: result.coachingNotes,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      alignment_improvements: result.alignmentImprovements,
      suggested_followups: result.suggestedFollowUps,
    });

    return NextResponse.json({
      success: true,
      improvedDraft: result.improvedDraft,
      coachingNotes: result.coachingNotes,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      alignmentImprovements: result.alignmentImprovements,
      suggestedFollowUps: result.suggestedFollowUps,
    });
  } catch (err: any) {
    console.error("Proposal coaching error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
