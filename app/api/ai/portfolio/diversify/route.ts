import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { grants } = await req.json();

    if (!grants) {
      return NextResponse.json({ error: "Missing grants" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Generate diversification strategy. Return JSON:
{
  "categoriesToExpand": string[],
  "categoriesOverloaded": string[],
  "recommendedMix": string[],
  "reasoning": string
}
          `
        },
        {
          role: "user",
          content: JSON.stringify(grants)
        }
      ],
      max_tokens: 2000
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Diversification error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
