export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import OpenAI from "openai";




const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Rewrite the text in the voice of a professional grant reviewer. Make it objective, structured, and criteria-focused.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      max_tokens: 1200,
    });

    return NextResponse.json({
      reviewerVersion: response.choices[0].message.content,
    });
  } catch (err: any) {
    console.error("Reviewer rewrite error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
