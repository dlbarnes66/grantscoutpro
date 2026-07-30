export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import OpenAI from "openai";




const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { grants, profile } = await req.json();

    if (!grants || !profile) {
      return NextResponse.json({ error: "Missing grants or profile" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Simulate grant pipeline. Return JSON:
{
  "months": [
    { "month": string, "expectedFunding": number, "events": string[] }
  ],
  "trajectory": string,
  "summary": string
}
          `
        },
        {
          role: "user",
          content: `
Grants:
${JSON.stringify(grants)}

Profile:
${JSON.stringify(profile)}
          `
        }
      ],
      max_tokens: 4000
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Pipeline simulation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
