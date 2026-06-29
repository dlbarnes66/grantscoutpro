import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { grantA, grantB, profile } = await req.json();

    if (!grantA || !grantB || !profile) {
      return NextResponse.json(
        { error: "Missing grantA, grantB, or profile" },
        { status: 400 }
      );
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Compare two grants in detail. Return JSON:
{
  "grantA": {
    "strengths": string[],
    "weaknesses": string[],
    "fitScore": number,
    "risk": "low" | "medium" | "high"
  },
  "grantB": {
    "strengths": string[],
    "weaknesses": string[],
    "fitScore": number,
    "risk": "low" | "medium" | "high"
  },
  "recommendation": string,
  "reasoning": string
}
          `,
        },
        {
          role: "user",
          content: `
User Profile:
${JSON.stringify(profile)}

Grant A:
${JSON.stringify(grantA)}

Grant B:
${JSON.stringify(grantB)}
          `,
        },
      ],
      max_tokens: 2000,
    });

    return NextResponse.json(
      JSON.parse(response.choices[0].message.content || "{}")
    );
  } catch (err: any) {
    console.error("Compare two grants error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
