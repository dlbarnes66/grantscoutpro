import { NextResponse } from "next/server";
import OpenAI from "openai";
import manual from "@/app/dashboard/help/manual/manual.json";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  const { question } = await req.json();

  if (!question) {
    return NextResponse.json(
      { error: "Missing question" },
      { status: 400 }
    );
  }

  const manualText = manual
    .map((section) => `${section.title}: ${section.content.join(" ")}`)
    .join("\n\n");

  const prompt = `
You are the GrantScout Pro help assistant.
Answer the user's question using the user manual below when relevant.

USER MANUAL:
${manualText}

QUESTION:
${question}

Provide a clear, helpful answer.
If relevant, reference the manual section titles.
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });

  const answer = response.choices[0].message.content;

  return NextResponse.json({ answer });
}
