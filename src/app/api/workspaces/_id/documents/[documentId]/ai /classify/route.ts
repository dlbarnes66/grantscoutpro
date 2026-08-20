import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { workspaceId: string; documentId: string } }
) {
  const { workspaceId, documentId } = params;

  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text = "", categories = [] } = await req.json().catch(() => ({}));

  const prompt = `
Classify this workspace document.

Workspace ID: ${workspaceId}
Document ID: ${documentId}

Categories:
${JSON.stringify(categories, null, 2)}

Text:
${text}

Return JSON with:
- classification
- confidenceScores
- reasoning
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({ success: true, classification: result });
}
