export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import OpenAI from "openai";




const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { grant, progress } = await req.json();

    if (!grant || !progress) {
      return NextResponse.json({ error: "Missing grant or progress" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Generate milestone tracking. Return JSON:
{
  "milestones": [
    { "name": string, "status": string, "details": string }
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

Progress:
${JSON.stringify(progress)}
          `
        }
      ],
      max_tokens: 3000
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Milestone tracking error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
