import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { sections } = await req.json();

    if (!sections) {
      return NextResponse.json({ error: "Missing sections" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Fix section coherence. Return JSON:
{
  "coherenceIssues": string[],
  "fixes": string[],
  "improvedSections": string[]
}
          `
        },
        {
          role: "user",
          content: JSON.stringify(sections)
        }
      ],
      max_tokens: 3500
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Coherence fix error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
