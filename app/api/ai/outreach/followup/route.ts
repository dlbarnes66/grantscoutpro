import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { funder, profile } = await req.json();

    if (!funder || !profile) {
      return NextResponse.json({ error: "Missing funder or profile" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Generate a follow-up sequence. Return JSON:
{
  "sequence": [
    { "day": number, "subject": string, "body": string }
  ]
}
          `
        },
        {
          role: "user",
          content: `
Funder:
${JSON.stringify(funder)}

User Profile:
${JSON.stringify(profile)}
          `
        }
      ],
      max_tokens: 3000
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Follow-up sequence error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
