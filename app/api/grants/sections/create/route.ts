import { NextResponse } from "next/server";
import { client } from "@/lib/openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { title, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "title and content are required" },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert grant writer. Create a polished, professional grant section
based on the following information:

Section Title:
${title}

Raw Content:
${content}

Rewrite this into a clear, structured, compelling grant section.
Improve clarity, flow, and persuasiveness while preserving the original meaning.
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
    console.error("Grant section creation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
