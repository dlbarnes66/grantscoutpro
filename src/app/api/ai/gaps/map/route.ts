export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import OpenAI from "openai";




const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { profile, grants } = await req.json();

    if (!profile || !grants) {
      return NextResponse.json({ error: "Missing profile or grants" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Generate a grant ecosystem map. Return JSON:
{
  "categories": string[],
  "relationships": string[],
  "gaps": string[],
  "strategicPaths": string[],
  "summary": string
}
          `
        },
        {
          role: "user",
          content: `
Profile:
${JSON.stringify(profile)}

Grants:
${JSON.stringify(grants)}
          `
        }
      ],
      max_tokens: 3500
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Ecosystem map error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
