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
  try {
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

    const body = await req.json().catch(() => ({}));

    const text = body.text ?? "";

    console.log(
      "COHERENCE ROUTE HIT",
      workspaceId,
      documentId
    );

    const prompt = `
Coherence Analysis

Workspace: ${workspaceId}
Document: ${documentId}

Text:
${text}

Return JSON with:
- coherenceScore
- logicalGaps
- contradictions
- recommendations
`;

    const result = await callUnifiedModel(prompt);

    console.log("OPENAI RESPONSE RECEIVED");

    return NextResponse.json({
      success: true,
      coherence: result,
    });
  } catch (error) {
    console.error(
      "COHERENCE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}
