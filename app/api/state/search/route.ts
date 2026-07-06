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
    const { state, query } = await req.json();

    if (!state || !query) {
      return NextResponse.json(
        { error: "state and query are required" },
        { status: 400 }
      );
    }

    // Fetch state-level sources
    const { data: sources } = await supabase
      .from("state_sources")
      .select("*")
      .eq("state", state);

    const prompt = `
You are an expert state-level grant search engine. Search for grants in the state of ${state} using the following sources:

Sources:
${JSON.stringify(sources, null, 2)}

User Query:
${query}

Provide a JSON response:
{
  "results": [
    {
      "title": string,
      "agency": string,
      "url": string,
      "summary": string,
      "deadline": string | null
    }
  ],
  "searchNotes": string[]
}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    await supabase.from("state_search_results").insert({
      state,
      query,
      results: result.results,
      search_notes: result.searchNotes,
    });

    return NextResponse.json({
      success: true,
      results: result.results,
      searchNotes: result.searchNotes,
    });
  } catch (err: any) {
    console.error("State search error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
