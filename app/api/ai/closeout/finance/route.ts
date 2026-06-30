import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { budget, spending } = await req.json();

    if (!budget || !spending) {
      return NextResponse.json({ error: "Missing budget or spending" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Perform financial reconciliation. Return JSON:
{
  "reconciliation": [
    {
      "category": string,
      "budgeted": number,
      "spent": number,
      "variance": number,
      "status": "under" | "over" | "matched"
    }
  ],
  "issues": string[],
  "summary": string
}
          `
        },
        {
          role: "user",
          content: `
Budget:
${JSON.stringify(budget)}

Spending:
${JSON.stringify(spending)}
          `
        }
      ],
      max_tokens: 3500
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Financial reconciliation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
