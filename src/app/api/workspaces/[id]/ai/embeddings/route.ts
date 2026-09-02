import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  const { _id: workspaceId } = params;
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { documents = [] } = await req.json().catch(() => ({}));

  const prompt = `
Workspace-Level Embeddings

Workspace: ${workspaceId}

Documents:
${JSON.stringify(documents, null, 2)}

Return JSON with:
- embeddingsByDocument
- semanticTags
- keyConcepts
`;

  const result = await callUnifiedModel(prompt);
  return NextResponse.json({ success: true, embeddings: result });
}
