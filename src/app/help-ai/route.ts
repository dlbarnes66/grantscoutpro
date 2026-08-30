import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const { question } = await req.json();

  if (!question) {
    return NextResponse.json(
      { error: "Missing question" },
      { status: 400 }
    );
  }

  const prompt = `
You are the GrantScout Pro help assistant.
Answer the user's question clearly and helpfully.
If relevant, provide step-by-step guidance.
User question:
${question}
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const answer = response.choices[0].message.content;

  return NextResponse.json({ answer });
}
