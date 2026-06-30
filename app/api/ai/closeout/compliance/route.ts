import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { grant, documentation } = await req.json();

    if (!grant || !documentation) {
      return NextResponse.json({ error: "Missing grant or documentation" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Perform closeout compliance scan. Return JSON:
{
  "issues": string[],
  "missingItems": string[],
  "severity": "low" | "medium" | "high",
  "requiredFixes": string[],
  "summary": string
}
          `
        },
        {
          role: "user",
          content: `
Grant Closeout Requirements:
${JSON.stringify(grant)}

Documentation:
${JSON.stringify(documentation)}
          `
        }
      ],
      max_tokens: 3500
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Closeout compliance error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
