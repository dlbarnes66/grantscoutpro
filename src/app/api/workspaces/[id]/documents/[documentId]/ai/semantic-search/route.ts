import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";
import { guardAIRequest } from "@/lib/ai/guardAIRequest";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  const { workspaceId, documentId } = params;
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { query = "", text = "" } = await req.json().catch(() => ({}));

  const prompt = `
Semantic Search Inside Workspace Document

Workspace: ${workspaceId}
Document: ${documentId}

Query:
${query}

Text:
${text}

Return JSON with:
- matches
- relevanceScores
- supportingEvidence
`;

  const __aiGuard = await guardAIRequest(params.id, userId);
  if (__aiGuard) return __aiGuard;

  const result = await callUnifiedModel(prompt);
  return NextResponse.json({ success: true, semanticSearch: result });
}
