import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }) {
  const { workspaceId, documentId } = params;

  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text = "" } = await req.json().catch(() => ({}));

  const prompt = `
Workspace Document Risk Analysis

Workspace: ${workspaceId}
Document: ${documentId}

Text:
${text}

Return JSON with:
- riskScore
- riskFactors
- vulnerabilities
- recommendedMitigation
`;

  const result = await callUnifiedModel(prompt);
  return NextResponse.json({ success: true, risk: result });
}
