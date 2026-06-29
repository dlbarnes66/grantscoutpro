import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { grant } = await req.json();

    if (!grant) {
      return NextResponse.json({ error: "Missing grant" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Summarize grant opportunities into a short, clear, actionable overview. Return JSON.",
        },
        {
          role: "user",
          content: JSON.stringify(grant),
        },
      ],
      max_tokens: 600,
    });

    return NextResponse.json(
      JSON.parse(response.choices[0].message.content || "{}")
    );
  } catch (err: any) {
    console.error("Opportunity summary error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
