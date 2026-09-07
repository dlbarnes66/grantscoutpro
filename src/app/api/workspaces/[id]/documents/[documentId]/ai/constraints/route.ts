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

  const { text = "", constraints = "" } = await req.json().catch(() => ({}));

  const prompt = `
Apply Constraints to Workspace Document

Workspace: ${workspaceId}
Document: ${documentId}

Constraints:
${constraints}

Text:
${text}

Return JSON with:
- constrainedText
- constraintViolations
- recommendedFixes
`;

  const __aiGuard = await guardAIRequest(params.id, userId);
  if (__aiGuard) return __aiGuard;

  const result = await callUnifiedModel(prompt);
  return NextResponse.json({ success: true, constraints: result });
}
