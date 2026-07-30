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
          "You are an expert grant writer. Return a JSON object with keys: sections (array of { title, score, summary, issues, highlights }), globalInsights (array of strings)."
      },
      {
        role: "user",
        content
      }
    ]
  });

  const text = completion.choices[0].message.content || "{}";

  let heatmap;
  try {
    heatmap = JSON.parse(text);
  } catch {
    heatmap = {
      sections: [],
      globalInsights: []
    };
  }

  return NextResponse.json({ heatmap });
}
