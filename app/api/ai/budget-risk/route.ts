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
          "You are a financial analyst for grants. Return a JSON object with keys: overallRisk (number), categories (array of { name, risk, summary, issues, recommendations }), globalRecommendations (array of strings). Risk is 0-100 (higher = more risk)."
      },
      {
        role: "user",
        content
      }
    ]
  });

  const text = completion.choices[0].message.content || "{}";

  let analysis;
  try {
    analysis = JSON.parse(text);
  } catch {
    analysis = {
      overallRisk: 0,
      categories: [],
      globalRecommendations: []
    };
  }

  return NextResponse.json({ analysis });
}
