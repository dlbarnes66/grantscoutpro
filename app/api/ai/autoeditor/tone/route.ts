import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { text, grant } = await req.json();

    if (!text || !grant) {
      return NextResponse.json({ error: "Missing text or grant" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Rewrite text to match funder tone. Return JSON:
{
  "rewritten": string,
  "toneAdjustments": string[],
  "alignmentScore": number
}
          `
        },
        {
          role: "user",
          content: `
Grant:
${JSON.stringify(grant)}

Text:
${text}
          `
        }
      ],
      max_tokens: 3000
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Tone correction error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
