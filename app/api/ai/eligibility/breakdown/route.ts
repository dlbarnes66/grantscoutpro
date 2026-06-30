import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { grant, profile } = await req.json();

    if (!grant || !profile) {
      return NextResponse.json(
        { error: "Missing grant or profile" },
        { status: 400 }
      );
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Provide eligibility scoring breakdown. Return JSON:
{
  "score": number,
  "criteria": [
    { "name": string, "score": number, "reason": string }
  ],
  "overallReasoning": string
}
          `,
        },
        {
          role: "user",
          content: `
Grant:
${JSON.stringify(grant)}

User Profile:
${JSON.stringify(profile)}
          `,
        },
      ],
      max_tokens: 2000,
    });

    return NextResponse.json(
      JSON.parse(response.choices[0].message.content || "{}")
    );
  } catch (err: any) {
    console.error("Eligibility breakdown error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
