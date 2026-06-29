import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { grants, profile } = await req.json();

    if (!grants || !profile) {
      return NextResponse.json(
        { error: "Missing grants or profile" },
        { status: 400 }
      );
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Create a comparison table. Return JSON:
{
  "columns": ["Grant", "Fit Score", "Risk", "Funding", "Deadline", "Summary"],
  "rows": [
    ["Grant Title", number, "low|medium|high", "range", "date", "summary"]
  ]
}
          `,
        },
        {
          role: "user",
          content: `
User Profile:
${JSON.stringify(profile)}

Grants:
${JSON.stringify(grants)}
          `,
        },
      ],
      max_tokens: 2000,
    });

    return NextResponse.json(
      JSON.parse(response.choices[0].message.content || "{}")
    );
  } catch (err: any) {
    console.error("Comparison table error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
