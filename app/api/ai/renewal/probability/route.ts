import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { grant, performance, compliance } = await req.json();

    if (!grant || !performance || !compliance) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Model renewal probability. Return JSON:
{
  "probability": number,
  "riskFactors": string[],
  "strengths": string[],
  "summary": string
}
          `
        },
        {
          role: "user",
          content: `
Grant:
${JSON.stringify(grant)}

Performance:
${JSON.stringify(performance)}

Compliance:
${JSON.stringify(compliance)}
          `
        }
      ],
      max_tokens: 3000
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Renewal probability error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
