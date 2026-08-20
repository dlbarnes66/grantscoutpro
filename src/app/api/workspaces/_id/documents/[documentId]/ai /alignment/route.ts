import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }) {
  const { workspaceId, documentId } = params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text = "", grant = {} } = await req.json().catch(() => ({}));

  const prompt = `
Analyze alignment between workspace document and grant.

Workspace: ${workspaceId}
Document: ${documentId}

Grant:
${JSON.stringify(grant, null, 2)}

Text:
${text}

Return JSON with:
- alignmentScore
- alignmentFactors
- gaps
- recommendations
`;

  const result = await callUnifiedModel(prompt);
  return NextResponse.json({ success: true, alignment: result });
}
