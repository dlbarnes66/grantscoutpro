export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { openai } from "@/lib/ai";

export async function POST(req: Request) {
  const { query } = await req.json();

  // In a full build, you'd load documents from the DB here.
  const documents = [
    {
      id: "doc1",
      title: "Community Impact Proposal",
      content: "This project will significantly improve community outcomes..."
    },
    {
      id: "doc2",
      title: "Budget Narrative",
      content: "The budget includes detailed allocations for staffing..."
    }
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a semantic search engine. Given a query and a list of documents, return a JSON array 'results' of { documentTitle, score, highlight } sorted by relevance. Score is 0-1."
      },
      {
        role: "user",
        content: JSON.stringify({ query, documents })
      }
    ]
  });

  const text = completion.choices[0].message.content || "{}";

  let results;
  try {
    const parsed = JSON.parse(text);
    results = parsed.results || [];
  } catch {
    results = [];
  }

  return NextResponse.json({ results });
}
