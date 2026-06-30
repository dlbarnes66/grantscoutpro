import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { grant, narrative } = await req.json();

    if (!grant || !narrative) {
      return NextResponse.json({ error: "Missing grant or narrative" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Align narrative with funder expectations. Return JSON:
{
  "alignedNarrative": string,
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

Narrative:
${JSON.stringify(narrative)}
          `
        }
      ],
      max_tokens: 3000
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Storytelling alignment error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
