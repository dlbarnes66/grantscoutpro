import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { projectDescription, fundingAmount } = await req.json();

    if (!projectDescription || !fundingAmount) {
      return NextResponse.json(
        { error: "Missing projectDescription or fundingAmount" },
        { status: 400 }
      );
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Create a detailed grant budget with line items, justification, and totals. Return JSON.",
        },
        {
          role: "user",
          content: `
Project Description:
${projectDescription}

Funding Amount:
${fundingAmount}
          `,
        },
      ],
      max_tokens: 1200,
    });

    return NextResponse.json(
      JSON.parse(response.choices[0].message.content || "{}")
    );
  } catch (err: any) {
    console.error("Budget planner error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
