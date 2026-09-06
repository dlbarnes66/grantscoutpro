import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

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
    instruction = "",
  } = await req.json().catch(() => ({}));

  const prompt = `
Inline Edit Workspace Document

Workspace: ${workspaceId}
Document: ${documentId}

Instruction:
${instruction}

Text:
${text}

Return JSON with:
- editedText
- changesApplied
- reasoning
`;

  console.log(
    "INLINE ROUTE HIT",
    workspaceId,
    documentId
  );

  const result = await callUnifiedModel(prompt);

  console.log("OPENAI RESPONSE RECEIVED");

  return NextResponse.json({
    success: true,
    inline: result,
  });
}