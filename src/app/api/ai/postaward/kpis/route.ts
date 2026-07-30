export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import OpenAI from "openai";




const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { grant, activities } = await req.json();

    if (!grant || !activities) {
      return NextResponse.json({ error: "Missing grant or activities" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Extract KPIs. Return JSON:
{
  "kpis": [
    { "name": string, "target": string, "measurement": string }
  ],
  "summary": string
}
          `
        },
        {
          role: "user",
          content: `
Grant:
${JSON.stringify(grant)}

Activities:
${JSON.stringify(activities)}
          `
        }
      ],
      max_tokens: 3000
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("KPI extraction error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
