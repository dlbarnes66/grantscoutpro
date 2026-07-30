export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import OpenAI from "openai";




const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { step, context } = await req.json();

    if (!step) {
      return NextResponse.json({ error: "Missing step" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Execute the step. Return JSON:
{
  "result": string,
  "nextContext": any
}
          `,
        },
        {
          role: "user",
          content: `
Step:
${JSON.stringify(step)}

Context:
${JSON.stringify(context ?? {})}
          `,
        },
      ],
      max_tokens: 1500,
    });

    return NextResponse.json(
      JSON.parse(response.choices[0].message.content || "{}")
    );
  } catch (err: any) {
    console.error("Agent execute error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
