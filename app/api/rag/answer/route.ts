import { NextResponse } from "next/server";
import { resolveContext } from "@/lib/ai/context-resolver";
import { generateRagAnswer } from "@/lib/ai/llm";

/**
 * RAG answer endpoint.
 *
 * Accepts:
 * {
 *   question: string
 * }
 *
 * Returns:
 * - grounded answer
 * - source documents + similarity scores
 */

export async function POST(req: Request) {
  try {
    // 1. Resolve workspace + user
    const { workspaceId } = await resolveContext(req);

    const body = await req.json();
    const { question } = body;

    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        { error: "Question cannot be empty" },
        { status: 400 }
      );
    }

    // 2. Generate grounded RAG answer
    const result = await generateRagAnswer(workspaceId, question);

    return NextResponse.json({
      question,
      answer: result.answer,
      sources: result.sources,
    });
  } catch (err: any) {
    console.error("RAG answer error:", err);
    return NextResponse.json(
      { error: err.message || "RAG answer failed" },
      { status: 500 }
    );
  }
}
