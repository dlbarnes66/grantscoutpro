import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { grant, performance } = await req.json();

    if (!grant || !performance) {
      return NextResponse.json({ error: "Missing grant or performance" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Analyze renewal eligibility. Return JSON:
{
  "eligible": boolean,
  "reasons": string[],
  "issues": string[],
  "requirements": string[],
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
          `
        }
      ],
      max_tokens: 3000
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Renewal eligibility error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
