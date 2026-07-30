export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import OpenAI from "openai";




const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { grants, profile } = await req.json();

    if (!grants || !profile) {
      return NextResponse.json(
        { error: "Missing grants or profile" },
        { status: 400 }
      );
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Score each grant for portfolio optimization.

Return JSON array:
[
  {
    "grantId": string,
    "strategicValue": number,
    "alignment": number,
    "feasibility": number,
    "expectedReward": number,
    "risk": number,
    "timeCost": number,
    "overallScore": number,
    "reasoning": string
  }
]
          `,
        },
        {
          role: "user",
          content: `
User Profile:
${JSON.stringify(profile)}

Grants:
${JSON.stringify(grants)}
          `,
        },
      ],
      max_tokens: 2000,
    });

    return NextResponse.json(
      JSON.parse(response.choices[0].message.content || "[]")
    );
  } catch (err: any) {
    console.error("Portfolio breakdown error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
