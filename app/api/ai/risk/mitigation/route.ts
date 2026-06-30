import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { risks } = await req.json();

    if (!risks) {
      return NextResponse.json({ error: "Missing risks" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Generate mitigation plan. Return JSON:
{
  "mitigationSteps": string[],
  "priority": string[],
  "timeline": string[],
  "summary": string
}
          `
        },
        {
          role: "user",
          content: JSON.stringify(risks)
        }
      ],
      max_tokens: 2500
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Mitigation plan error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
