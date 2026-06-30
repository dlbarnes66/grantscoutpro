import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { text, constraints } = await req.json();

    if (!text || !constraints) {
      return NextResponse.json({ error: "Missing text or constraints" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Rewrite text with constraints. Return JSON:
{
  "rewritten": string,
  "constraintReport": string[],
  "metConstraints": boolean
}
          `
        },
        {
          role: "user",
          content: `
Constraints:
${JSON.stringify(constraints)}

Text:
${text}
          `
        }
      ],
      max_tokens: 3500
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Constraint rewrite error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
