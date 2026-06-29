import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { industry, location, fundingRange } = await req.json();

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Generate realistic grant opportunities with title, description, deadline, industry, location, and funding range. Return JSON.",
        },
        {
          role: "user",
          content: `
Industry: ${industry}
Location: ${location}
Funding Range: ${fundingRange}

Generate 5 grant opportunities.
          `,
        },
      ],
      max_tokens: 1200,
    });

    return NextResponse.json(
      JSON.parse(response.choices[0].message.content || "[]")
    );
  } catch (err: any) {
    console.error("Grant generator error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
