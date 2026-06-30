import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

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
          content: `
Improve grammar, clarity, and readability. Return JSON:
{
  "improved": string,
  "grammarFixes": string[],
  "clarityFixes": string[],
  "readabilityScore": number
}
          `
        },
        {
          role: "user",
          content: text
        }
      ],
      max_tokens: 3000
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Clarity optimization error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
