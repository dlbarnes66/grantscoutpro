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
          "You are a strategy consultant evaluating scalability. Return a JSON object with keys: overallScore (number), dimensions (array of { name, score, summary, bottlenecks, recommendations }), globalInsights (array of strings)."
      },
      {
        role: "user",
        content
      }
    ]
  });

  const text = completion.choices[0].message.content || "{}";

  let scalability;
  try {
    scalability = JSON.parse(text);
  } catch {
    scalability = {
      overallScore: 0,
      dimensions: [],
      globalInsights: []
    };
  }

  return NextResponse.json({ scalability });
}
