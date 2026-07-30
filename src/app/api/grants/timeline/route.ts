export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const { grantText } = await request.json();

    if (!grantText) {
      return NextResponse.json(
        { error: "grantText is required" },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert grant analyst. Extract a clear, structured timeline from the following grant text.

Include:
1. Application open date
2. Application close date
3. Review period
4. Award announcement date
5. Project start and end dates (if applicable)
6. Any other important milestones

Grant Text:
${grantText}
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
    console.error("Grant timeline extraction error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
