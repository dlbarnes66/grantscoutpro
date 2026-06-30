import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { funder, message } = await req.json();

    if (!funder || !message) {
      return NextResponse.json({ error: "Missing funder or message" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Simulate a funder persona. Return JSON:
{
  "funderResponse": string,
  "tone": string,
  "concerns": string[],
  "nextSteps": string[]
}
          `
        },
        {
          role: "user",
          content: `
Funder:
${JSON.stringify(funder)}

Message:
${JSON.stringify(message)}
          `
        }
      ],
      max_tokens: 2500
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Persona simulation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
