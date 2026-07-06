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
    const { workspaceId } = await req.json();

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    // Fetch all structured state grants
    const { data: grants } = await supabase
      .from("state_structured_grants")
      .select("*");

    // Fetch all intelligence signals for this workspace
    const { data: intelligence } = await supabase
      .from("state_intelligence")
      .select("*")
      .eq("workspace_id", workspaceId);

    // Fetch all insights (risk + opportunity)
    const { data: insights } = await supabase
      .from("state_insights")
      .select("*")
      .eq("workspace_id", workspaceId);

    const prompt = `
You are an expert state-level grant ranking engine. Rank all state grants for this workspace using:

Structured Grants:
${JSON.stringify(grants, null, 2)}

Intelligence Signals:
${JSON.stringify(intelligence, null, 2)}

Insights:
${JSON.stringify(insights, null, 2)}

Provide a JSON response:
{
  "rankedGrants": [
    {
      "stateGrantId": number,
      "title": string,
      "agency": string,
      "score": number,
      "matchConfidence": number,
      "eligibility": boolean,
      "riskLevel": "low" | "medium" | "high",
      "opportunityStrength": string,
      "rank": number
    }
  ],
  "rankingNotes": string[],
  "summary": string
}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    await supabase.from("state_rankings").insert({
      workspace_id: workspaceId,
      ranked_grants: result.rankedGrants,
      ranking_notes: result.rankingNotes,
      summary: result.summary,
    });

    return NextResponse.json({
      success: true,
      rankedGrants: result.rankedGrants,
      rankingNotes: result.rankingNotes,
      summary: result.summary,
    });
  } catch (err: any) {
    console.error("State ranking error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
