export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const { lineItems } = await request.json();

    if (!lineItems || !Array.isArray(lineItems)) {
      return NextResponse.json(
        { error: "lineItems array is required" },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert grant budget analyst. Review the following budget line items
and provide a clear, concise summary of issues, risks, and recommendations.

Line Items:
${lineItems.map((i: any) => `- ${i.name}: $${i.amount}`).join("\n")}
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
    console.error("Budget analysis error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
