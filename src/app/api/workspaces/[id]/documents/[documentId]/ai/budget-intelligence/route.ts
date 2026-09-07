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

  const { budget = {}, text = "" } = await req.json().catch(() => ({}));

  const prompt = `
Budget-Linked Workspace Document Intelligence

Workspace: ${workspaceId}
Document: ${documentId}

Budget:
${JSON.stringify(budget, null, 2)}

Text:
${text}

Return JSON with:
- budgetAlignmentScore
- costReasonableness
- budgetNarrativeFit
- missingBudgetElements
- recommendations
`;

  const __aiGuard = await guardAIRequest(params.id, userId);
  if (__aiGuard) return __aiGuard;

  const result = await callUnifiedModel(prompt);
  return NextResponse.json({ success: true, budgetIntelligence: result });
}
