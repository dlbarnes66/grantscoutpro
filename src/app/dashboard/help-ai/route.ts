import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import manual from "@/app/dashboard/help/manual/manual.json";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: NextRequest, context: { params: Record<string, string> }) {
  const { params } = context;
  const { question } = await req.json();

  const prompt = `
You are the GrantScout Pro help assistant.
Use the following manual content to answer the user's question:

${JSON.stringify(manual)}

User question: ${question}
`;

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });

  return NextResponse.json({
    answer: completion.choices[0].message.content
  });
}

