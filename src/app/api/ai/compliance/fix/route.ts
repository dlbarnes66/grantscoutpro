export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import OpenAI from "openai";




const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { issues } = await req.json();

    if (!issues) {
      return NextResponse.json({ error: "Missing issues" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Generate compliance fixes. Return JSON:
{
  "fixes": string[],
  "priority": string[],
  "steps": string[],
  "summary": string
}
          `
        },
        {
          role: "user",
          content: JSON.stringify(issues)
        }
      ],
      max_tokens: 3500
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Compliance fix error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
