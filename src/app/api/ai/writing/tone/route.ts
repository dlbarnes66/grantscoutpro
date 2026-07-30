export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import OpenAI from "openai";




const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { text, tone } = await req.json();

    if (!text || !tone) {
      return NextResponse.json({ error: "Missing text or tone" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Rewrite text with the requested tone. Return JSON: { rewritten: string }"
        },
        {
          role: "user",
          content: `
Tone: ${tone}

Text:
${text}
          `
        }
      ],
      max_tokens: 2000
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Tone adjustment error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
