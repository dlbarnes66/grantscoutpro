import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }) {
  const { workspaceId, documentId } = params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text = "", rubric = {} } = await req.json().catch(() => ({}));

  const prompt = `
Score this workspace document using the rubric.

Workspace: ${workspaceId}
Document: ${documentId}

Rubric:
${JSON.stringify(rubric, null, 2)}

Text:
${text}

Return JSON with:
- scoresByCriterion
- totalScore
- strengths
- weaknesses
- recommendations
`;

  const result = await callUnifiedModel(prompt);
  return NextResponse.json({ success: true, scoring: result });
}
