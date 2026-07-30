export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "text is required" },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert grant reviewer. Provide a structured, professional review of the following grant narrative.

Include:
1. Summary of the narrative
2. Strengths
3. Weaknesses or risks
4. Alignment with typical grant criteria
5. Recommendations for improvement

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
    console.error("Grant review error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
