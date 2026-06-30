import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { previousBudget, newGoals } = await req.json();

    if (!previousBudget || !newGoals) {
      return NextResponse.json({ error: "Missing previousBudget or newGoals" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Update renewal budget. Return JSON:
{
  "updatedBudget": [
    { "category": string, "amount": number, "reason": string }
  ],
  "changes": string[],
  "summary": string
}
          `
        },
        {
          role: "user",
          content: `
Previous Budget:
${JSON.stringify(previousBudget)}

New Goals:
${JSON.stringify(newGoals)}
          `
        }
      ],
      max_tokens: 3500
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Renewal budget update error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
