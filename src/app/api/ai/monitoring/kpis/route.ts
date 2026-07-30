export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import OpenAI from "openai";




const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { kpis, progress } = await req.json();

    if (!kpis || !progress) {
      return NextResponse.json({ error: "Missing kpis or progress" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Track KPI progress. Return JSON:
{
  "kpiStatus": [
    {
      "name": string,
      "target": string,
      "current": string,
      "status": "on track" | "behind" | "ahead",
      "variance": string
    }
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

Progress:
${JSON.stringify(progress)}
          `
        }
      ],
      max_tokens: 3000
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("KPI tracking error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
