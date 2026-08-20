import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  const { workspaceId, documentId } = params;
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { comments = [] } = await req.json().catch(() => ({}));

  const prompt = `
Analyze comments for workspace document.

Workspace: ${workspaceId}
Document: ${documentId}

Comments:
${JSON.stringify(comments, null, 2)}

Return JSON with:
- commentThemes
- sentimentAnalysis
- unresolvedIssues
- recommendedActions
`;

  const result = await callUnifiedModel(prompt);
  return NextResponse.json({ success: true, comments: result });
}
