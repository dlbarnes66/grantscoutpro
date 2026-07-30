export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import OpenAI from "openai";




const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { funder, profile } = await req.json();

    if (!funder || !profile) {
      return NextResponse.json({ error: "Missing funder or profile" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Draft a grant opportunity in the style of the funder. Return JSON:
{
  "title": string,
  "amount": number,
  "deadline": string,
  "focusAreas": string[],
  "requirements": string[],
  "description": string
}
          `
        },
        {
          role: "user",
          content: `
Funder:
${JSON.stringify(funder)}

Profile:
${JSON.stringify(profile)}
          `
        }
      ],
      max_tokens: 3500
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Funder-style grant error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
