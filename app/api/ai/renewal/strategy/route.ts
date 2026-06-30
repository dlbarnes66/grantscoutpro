import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { grant, performance, risks } = await req.json();

    if (!grant || !performance || !risks) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Generate renewal strategy. Return JSON:
{
  "actions": string[],
  "priority": string[],
  "timeline": string[],
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

Risks:
${JSON.stringify(risks)}
          `
        }
      ],
      max_tokens: 3500
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Renewal strategy error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
