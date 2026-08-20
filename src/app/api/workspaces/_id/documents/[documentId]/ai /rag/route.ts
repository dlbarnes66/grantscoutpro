import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  const { workspaceId, documentId } = params;
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { query = "", chunks = [] } = await req.json().catch(() => ({}));

  const prompt = `
Document-Level RAG Query

Workspace: ${workspaceId}
Document: ${documentId}

Query:
${query}

Chunks:
${JSON.stringify(chunks, null, 2)}

Return JSON with:
- answer
- supportingChunks
- confidenceScore
`;

  const result = await callUnifiedModel(prompt);
  return NextResponse.json({ success: true, rag: result });
}
