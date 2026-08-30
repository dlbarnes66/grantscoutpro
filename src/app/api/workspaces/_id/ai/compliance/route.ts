import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  const { _id: workspaceId } = params;
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { documents = [], requirements = {} } = await req.json().catch(() => ({}));

  const prompt = `
Workspace-Level Compliance Analysis

Workspace: ${workspaceId}

Requirements:
${JSON.stringify(requirements, null, 2)}

Documents:
${JSON.stringify(documents, null, 2)}

Return JSON with:
- complianceScore
- violations
- missingElements
- recommendedFixes
`;

  const result = await callUnifiedModel(prompt);
  return NextResponse.json({ success: true, compliance: result });
}
