export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import OpenAI from "openai";




const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { goal } = await req.json();

    if (!goal) {
      return NextResponse.json({ error: "Missing goal" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are an autonomous AI agent. Break the user's goal into actionable steps.
Return JSON:
{
  "steps": [
    { "id": number, "action": string, "description": string }
  ]
}
          `,
        },
        {
          role: "user",
          content: goal,
        },
      ],
      max_tokens: 1500,
    });

    return NextResponse.json(
      JSON.parse(response.choices[0].message.content || "{}")
    );
  } catch (err: any) {
    console.error("Agent plan error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
