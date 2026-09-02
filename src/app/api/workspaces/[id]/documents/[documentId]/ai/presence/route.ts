import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  const { workspaceId, documentId } = params;
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { presenceData = {} } = await req.json().catch(() => ({}));

  const prompt = `
Analyze presence activity for workspace document.

Workspace: ${workspaceId}
Document: ${documentId}

Presence Data:
${JSON.stringify(presenceData, null, 2)}

Return JSON with:
- activitySummary
- collaborationPatterns
- riskIndicators
- recommendations
`;

  const result = await callUnifiedModel(prompt);
  return NextResponse.json({ success: true, presence: result });
}
