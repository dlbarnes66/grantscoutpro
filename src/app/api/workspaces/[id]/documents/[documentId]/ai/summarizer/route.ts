import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";
import { guardAIRequest } from "@/lib/ai/guardAIRequest";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { workspaceId: string; documentId: string } }
) {
  const { workspaceId, documentId } = params;

  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text = "", mode = "default" } = await req.json().catch(() => ({}));

  const prompt = `
Summarize this workspace document.

Workspace ID: ${workspaceId}
Document ID: ${documentId}
Mode: ${mode}

Text:
${text}

Return JSON with:
- summary
- keyPoints
- insights
`;

  const __aiGuard = await guardAIRequest((params as any).id, userId);
  if (__aiGuard) return __aiGuard;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({ success: true, summary: result });
}
