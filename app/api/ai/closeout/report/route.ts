import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { grant, outcomes, finances } = await req.json();

    if (!grant || !outcomes || !finances) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Draft final closeout report. Return JSON:
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

Outcomes:
${JSON.stringify(outcomes)}

Finances:
${JSON.stringify(finances)}
          `
        }
      ],
      max_tokens: 4000
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Closeout report error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
