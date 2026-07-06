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

    // Fetch federal rankings
    const { data: federalRankings } = await supabase
      .from("grant_rankings")
      .select("*")
      .eq("workspace_id", workspaceId)
      .single();

    // Fetch state rankings
    const { data: stateRankings } = await supabase
      .from("state_rankings")
      .select("*")
      .eq("workspace_id", workspaceId)
      .single();

    // Fetch structured federal grants
    const { data: federalGrants } = await supabase
      .from("structured_grants")
      .select("*");

    // Fetch structured state grants
    const { data: stateGrants } = await supabase
      .from("state_structured_grants")
      .select("*");

    const prompt = `
You are an expert grant intelligence aggregator. Combine federal and state-level grant rankings into a unified GrantRadar feed.

Federal Rankings:
${JSON.stringify(federalRankings?.ranked_grants || [], null, 2)}

State Rankings:
${JSON.stringify(stateRankings?.ranked_grants || [], null, 2)}

Federal Grants:
${JSON.stringify(federalGrants || [], null, 2)}

State Grants:
${JSON.stringify(stateGrants || [], null, 2)}

Provide a JSON response:
{
  "unifiedFeed": [
    {
      "type": "federal" | "state",
      "grantId": number,
      "title": string,
      "agency": string,
      "score": number,
      "matchConfidence": number,
      "eligibility": boolean,
      "riskLevel": string,
      "rank": number
    }
  ],
  "feedSummary": string,
  "recommendations": string[]
}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    await supabase.from("grantradar_unified").insert({
      workspace_id: workspaceId,
      unified_feed: result.unifiedFeed,
      feed_summary: result.feedSummary,
      recommendations: result.recommendations,
    });

    return NextResponse.json({
      success: true,
      unifiedFeed: result.unifiedFeed,
      feedSummary: result.feedSummary,
      recommendations: result.recommendations,
    });
  } catch (err: any) {
    console.error("Unified GrantRadar error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
