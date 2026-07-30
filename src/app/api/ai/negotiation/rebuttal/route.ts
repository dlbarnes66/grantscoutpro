export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import OpenAI from "openai";




const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { grant, objections } = await req.json();

    if (!grant || !objections) {
      return NextResponse.json({ error: "Missing grant or objections" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Prepare rebuttals. Return JSON:
{
  "rebuttals": string[],
  "toneGuidance": string,
  "riskMitigation": string
}
          `
        },
        {
          role: "user",
          content: `
Grant:
${JSON.stringify(grant)}

Objections:
${JSON.stringify(objections)}
          `
        }
      ],
      max_tokens: 2000
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Rebuttal error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
