export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import OpenAI from "openai";




const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { text, tones } = await req.json();

    if (!text || !tones || !Array.isArray(tones)) {
      return NextResponse.json(
        { error: "Missing text or tones array" },
        { status: 400 }
      );
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Rewrite the text in multiple tones. Return JSON array:
[
  { "tone": string, "content": string }
]
          `,
        },
        {
          role: "user",
          content: `
Text:
${text}

Tones:
${JSON.stringify(tones)}
          `,
        },
      ],
      max_tokens: 2000,
    });

    return NextResponse.json(
      JSON.parse(response.choices[0].message.content || "[]")
    );
  } catch (err: any) {
    console.error("Rewrite multi error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
