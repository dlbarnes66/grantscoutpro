export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import OpenAI from "openai";




const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { grant, outcomes } = await req.json();

    if (!grant || !outcomes) {
      return NextResponse.json({ error: "Missing grant or outcomes" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Generate post-award narrative. Return JSON:
{
  "narrative": string,
  "impactHighlights": string[],
  "lessonsLearned": string[],
  "futurePlans": string[]
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
          `
        }
      ],
      max_tokens: 3500
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Post-award narrative error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
