import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  const { workspaceId, documentId } = params;
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { viewerData = {} } = await req.json().catch(() => ({}));

  const prompt = `
Analyze viewer behavior for workspace document.

Workspace: ${workspaceId}
Document: ${documentId}

Viewer Data:
${JSON.stringify(viewerData, null, 2)}

Return JSON with:
- viewerInsights
- engagementPatterns
- dropoffPoints
- recommendations
`;

  const result = await callUnifiedModel(prompt);
  return NextResponse.json({ success: true, viewer: result });
}
