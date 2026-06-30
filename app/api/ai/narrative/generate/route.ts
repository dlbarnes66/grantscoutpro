import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { grant, profile } = await req.json();

    if (!grant || !profile) {
      return NextResponse.json({ error: "Missing grant or profile" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Generate a multi-section grant narrative. Return JSON:
{
  "sections": [
    { "title": string, "content": string }
  ],
  "summary": string
}
          `
        },
        {
          role: "user",
          content: `
Grant:
${JSON.stringify(grant)}

Profile:
${JSON.stringify(profile)}
          `
        }
      ],
      max_tokens: 4000
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Narrative generation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
