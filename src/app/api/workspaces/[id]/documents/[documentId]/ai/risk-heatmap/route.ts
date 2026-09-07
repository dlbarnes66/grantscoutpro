import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";
import { guardAIRequest } from "@/lib/ai/guardAIRequest";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  context: {
    params: Promise<{
      id: string;
      documentId: string;
    }>;
  }
) {
  const params = await context.params;

  const workspaceId = params.id;
  const documentId = params.documentId;

  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const {
    text = "",
  } = await req.json().catch(() => ({}));

  const prompt = `
Generate a risk heatmap for this workspace document.

Workspace: ${workspaceId}
Document: ${documentId}

Text:
${text}

Return JSON with:
- heatmap
- riskCategories
- severityLevels
- mitigationRecommendations
`;

  console.log(
    "RISK HEATMAP ROUTE HIT",
    workspaceId,
    documentId
  );

  const __aiGuard = await guardAIRequest(params.id, userId);
  if (__aiGuard) return __aiGuard;

  const result = await callUnifiedModel(prompt);

  console.log("OPENAI RESPONSE RECEIVED");

  return NextResponse.json({
    success: true,
    heatmap: result,
  });
}