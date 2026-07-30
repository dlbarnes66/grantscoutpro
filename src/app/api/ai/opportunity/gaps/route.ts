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
Analyze opportunity gaps. Return JSON:
{
  "missingCategories": string[],
  "underfundedAreas": string[],
  "newOpportunityIdeas": string[],
  "summary": string
}
          `
        },
        {
          role: "user",
          content: `
Existing Grants:
${JSON.stringify(grants)}

Profile:
${JSON.stringify(profile)}
          `
        }
      ],
      max_tokens: 3000
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Opportunity gap error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
