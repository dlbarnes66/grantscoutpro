import { NextResponse } from "next/server";
import { client } from "@/lib/openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { sections } = await req.json();

    if (!sections || !Array.isArray(sections)) {
      return NextResponse.json(
        { error: "sections array is required" },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert grant writer. Assemble the following grant packet sections
into a polished, cohesive, professional narrative. Improve clarity, flow,
and consistency while preserving the original meaning.

Sections:
${sections.map((s: any) => `\n---\n${s.title}\n${s.content}`).join("\n")}
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
    console.error("Grant packet assembly error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
