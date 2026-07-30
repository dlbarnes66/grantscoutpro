export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import OpenAI from "openai";




const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { kpis, milestones, forecast, health } = await req.json();

    if (!kpis || !milestones || !forecast || !health) {
      return NextResponse.json({ error: "Missing dashboard inputs" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Generate performance dashboard. Return JSON:
{
  "sections": [
    { "title": string, "content": string }
  ],
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

Forecast:
${JSON.stringify(forecast)}

Health:
${JSON.stringify(health)}
          `
        }
      ],
      max_tokens: 4000
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Dashboard generation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
