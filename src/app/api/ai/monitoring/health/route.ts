export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import OpenAI from "openai";




const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { kpis, milestones, risks } = await req.json();

    if (!kpis || !milestones || !risks) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Generate grant health score. Return JSON:
{
  "healthScore": number,
  "status": "excellent" | "good" | "fair" | "poor",
  "drivers": string[],
  "risks": string[],
  "summary": string
}
          `
        },
        {
          role: "user",
          content: `
KPIs:
${JSON.stringify(kpis)}

Milestones:
${JSON.stringify(milestones)}

Risks:
${JSON.stringify(risks)}
          `
        }
      ],
      max_tokens: 3500
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Health score error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
