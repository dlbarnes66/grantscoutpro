import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    const html = await fetch(url).then((res) => res.text());

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
    console.error("URL detection error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
