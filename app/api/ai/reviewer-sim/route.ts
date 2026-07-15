import { NextResponse } from "next/server";
import { openai } from "@/lib/ai";

export async function POST(req: Request) {
  const { content } = await req.json();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are an expert federal grant reviewer. Analyze the grant and produce a structured reviewer simulation."
      },
      {
        role: "user",
        content
      }
    ]
  });

  const text = completion.choices[0].message.content;

  return NextResponse.json({ simulation: JSON.parse(text) });
}
