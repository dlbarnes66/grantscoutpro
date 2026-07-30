export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import OpenAI from "openai";




const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are GrantScout Pro's AI Grant Assistant. Provide clear, actionable guidance for grants, applications, eligibility, and strategy.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 600,
    });

    const output = response.choices[0].message.content;

    return NextResponse.json({ output });
  } catch (err: any) {
    console.error("AI Grant Assistant error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
