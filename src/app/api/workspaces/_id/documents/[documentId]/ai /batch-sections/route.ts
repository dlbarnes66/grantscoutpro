import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  const { workspaceId, documentId } = params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sections = [] } = await req.json().catch(() => ({}));

  const prompt = `
Multi-Section Batch Processing

Workspace: ${workspaceId}
Document: ${documentId}

Sections:
${JSON.stringify(sections, null, 2)}

Return JSON with:
- processedSections
- notes
- errors
`;

  const result = await callUnifiedModel(prompt);
  return NextResponse.json({ success: true, batchSections: result });
}
