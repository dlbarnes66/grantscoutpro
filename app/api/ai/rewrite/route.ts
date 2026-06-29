import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Rewrite grant descriptions to be clearer, more compelling, and easier to understand.",
        },
        { role: "user", content: text },
      ],
    });

    return NextResponse.json({ rewritten: response.choices[0].message.content });
  } catch (err: any) {
    console.error("Rewrite error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
