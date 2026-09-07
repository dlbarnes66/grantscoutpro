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
    criteria = "",
  } = await req.json().catch(() => ({}));

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

  console.log(
    "REVIEW ROUTE HIT",
    workspaceId,
    documentId
  );

  const __aiGuard = await guardAIRequest(params.id, userId);
  if (__aiGuard) return __aiGuard;

  const result = await callUnifiedModel(prompt);

  console.log("OPENAI RESPONSE RECEIVED");

  return NextResponse.json({
    success: true,
    review: result,
  });
}