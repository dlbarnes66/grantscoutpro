import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const html = await req.text();

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Extract grant opportunities from the HTML content. Return JSON array:
[
  {
    "title": string,
    "description": string,
    "deadline": string | null,
    "fundingRange": string | null,
    "category": string | null
  }
]
          `,
        },
        {
          role: "user",
          content: html,
        },
      ],
      max_tokens: 2500,
    });

    return NextResponse.json(
      JSON.parse(response.choices[0].message.content || "[]")
    );
  } catch (err: any) {
    console.error("HTML detection error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
