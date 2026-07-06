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
    const { state, rawGrant } = await req.json();

    if (!state || !rawGrant) {
      return NextResponse.json(
        { error: "state and rawGrant are required" },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert state-level grant structuring engine. Structure the following raw grant data from the state of ${state}.

Raw Grant Data:
${JSON.stringify(rawGrant, null, 2)}

Provide a JSON response:
{
  "title": string,
  "agency": string,
  "state": string,
  "summary": string,
  "description": string,
  "deadline": string | null,
  "fundingAmount": string | null,
  "eligibility": string[],
  "categories": string[],
  "requirements": string[],
  "attachments": string[],
  "sourceUrl": string,
  "structuringNotes": string[]
}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.25,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    await supabase.from("state_structured_grants").insert({
      state,
      title: result.title,
      agency: result.agency,
      summary: result.summary,
      description: result.description,
      deadline: result.deadline,
      funding_amount: result.fundingAmount,
      eligibility: result.eligibility,
      categories: result.categories,
      requirements: result.requirements,
      attachments: result.attachments,
      source_url: result.sourceUrl,
      structuring_notes: result.structuringNotes,
    });

    return NextResponse.json({
      success: true,
      structured: result,
    });
  } catch (err: any) {
    console.error("State structuring error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
