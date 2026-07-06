import { NextResponse } from "next/server";
import { client } from "@/lib/openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { text, tone } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "text is required" },
        { status: 400 }
      );
    }

    const selectedTone = tone || "professional";

    const prompt = `
Rewrite the following grant narrative in a ${selectedTone} tone.
Improve clarity, structure, and persuasiveness while preserving the original meaning.

Grant Narrative:
${text}
    `;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return NextResponse.json({
      result: response.choices[0].message,
    });
  } catch (err: any) {
    console.error("Grant rewrite error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
