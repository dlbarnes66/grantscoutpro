import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { reviewers } = await req.json();

    if (!reviewers) {
      return NextResponse.json({ error: "Missing reviewers" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Analyze reviewer disagreements. Return JSON:
{
  "disagreementLevel": "low" | "medium" | "high",
  "conflictAreas": string[],
  "summary": string
}
          `
        },
        {
          role: "user",
          content: JSON.stringify(reviewers)
        }
      ],
      max_tokens: 2500
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Disagreement analysis error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
