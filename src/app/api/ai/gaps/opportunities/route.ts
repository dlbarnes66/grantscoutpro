export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import OpenAI from "openai";




const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { gaps, unmetNeeds } = await req.json();

    if (!gaps || !unmetNeeds) {
      return NextResponse.json({ error: "Missing gaps or unmetNeeds" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Create strategic grant opportunities. Return JSON:
{
  "opportunities": [
    {
      "title": string,
      "amount": number,
      "deadline": string,
      "category": string,
      "description": string,
      "gapAddressed": string
    }
  ]
}
          `
        },
        {
          role: "user",
          content: `
Gaps:
${JSON.stringify(gaps)}

Unmet Needs:
${JSON.stringify(unmetNeeds)}
          `
        }
      ],
      max_tokens: 3500
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Strategic opportunity error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
