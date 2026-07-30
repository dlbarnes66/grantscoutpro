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
You are an expert grant analyst. Provide detailed intelligence on the following grant text:
- Eligibility insights
- Strategic fit
- Risks or red flags
- Funding competitiveness
- Recommendations

Grant Text:
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
    console.error("Grant intelligence error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
