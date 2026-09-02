import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }) {
  const { workspaceId, documentId } = params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text = "", criteria = "" } = await req.json().catch(() => ({}));

  const prompt = `
Reviewer Simulation for Workspace Document

Workspace: ${workspaceId}
Document: ${documentId}

Criteria:
${criteria}

Text:
${text}

Return JSON with:
- score
- strengths
- weaknesses
- missingElements
- recommendations
`;

  const result = await callUnifiedModel(prompt);
  return NextResponse.json({ success: true, review: result });
}
