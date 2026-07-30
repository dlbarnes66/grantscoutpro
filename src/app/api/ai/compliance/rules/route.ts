export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import OpenAI from "openai";




const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { funder, application } = await req.json();

    if (!funder || !application) {
      return NextResponse.json({ error: "Missing funder or application" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Apply funder-specific compliance rules. Return JSON:
{
  "violations": string[],
  "restrictedItems": string[],
  "formattingIssues": string[],
  "eligibilityConcerns": string[],
  "summary": string
}
          `
        },
        {
          role: "user",
          content: `
Funder:
${JSON.stringify(funder)}

Application:
${JSON.stringify(application)}
          `
        }
      ],
      max_tokens: 3500
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Funder rule engine error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
