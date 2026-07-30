export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { openai } from "@/lib/ai";

export async function POST(req: Request) {
  const { content } = await req.json();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an expert grant evaluator. Return a JSON object with keys: overallScore (number), categories (array of { name, score, summary }), recommendations (array of strings)."
      },
      {
        role: "user",
        content
      }
    ]
  });

  const text = completion.choices[0].message.content || "{}";

  let matrix;
  try {
    matrix = JSON.parse(text);
  } catch {
    matrix = {
      overallScore: 0,
      categories: [],
      recommendations: []
    };
  }

  return NextResponse.json({ matrix });
}
