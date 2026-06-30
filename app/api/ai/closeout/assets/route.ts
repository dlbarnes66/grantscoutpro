import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { assets } = await req.json();

    if (!assets) {
      return NextResponse.json({ error: "Missing assets" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Generate asset/inventory report. Return JSON:
{
  "items": [
    { "name": string, "value": number, "condition": string, "disposition": string }
  ],
  "summary": string
}
          `
        },
        {
          role: "user",
          content: JSON.stringify(assets)
        }
      ],
      max_tokens: 3000
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Asset reporting error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
