export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import OpenAI from "openai";




const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { text, tone } = await req.json();

    if (!text || !tone) {
      return NextResponse.json(
        { error: "Missing text or tone" },
        { status: 400 }
      );
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Rewrite the text in a ${tone} tone. Keep meaning but improve clarity and professionalism.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      max_tokens: 1200,
    });

    return NextResponse.json({
      rewritten: response.choices[0].message.content,
    });
  } catch (err: any) {
    console.error("Rewrite single error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
