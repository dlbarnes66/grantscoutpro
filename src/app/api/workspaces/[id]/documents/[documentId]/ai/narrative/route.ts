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

  const { text = "", mode = "improve" } = await req.json().catch(() => ({}));

  const prompt = `
Workspace Narrative Intelligence

Workspace: ${workspaceId}
Document: ${documentId}
Mode: ${mode}

Text:
${text}

Return JSON with:
- narrativeScore
- flowIssues
- logicBreaks
- storytellingImprovements
- recommendedFixes
`;

  const __aiGuard = await guardAIRequest(params.id, userId);
  if (__aiGuard) return __aiGuard;

  const result = await callUnifiedModel(prompt);
  return NextResponse.json({ success: true, narrative: result });
}
