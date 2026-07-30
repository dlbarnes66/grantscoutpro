export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import OpenAI from "openai";




const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { budget, grant } = await req.json();

    if (!budget || !grant) {
      return NextResponse.json({ error: "Missing budget or grant" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Justify budget. Return JSON:
{
  "justifications": [
    { "category": string, "reason": string }
  ],
  "costEfficiency": string[],
  "fundingImpact": string
}
          `
        },
        {
          role: "user",
          content: `
Grant:
${JSON.stringify(grant)}

Budget:
${JSON.stringify(budget)}
          `
        }
      ],
      max_tokens: 2500
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Cost justification error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
