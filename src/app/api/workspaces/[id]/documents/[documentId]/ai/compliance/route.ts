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
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const params = await context.params;

    console.log(
      "COMPLIANCE ROUTE HIT",
      params.id,
      params.documentId
    );

    const body = await req.json().catch(() => ({}));

    const text = body.text ?? "";
    const requirements = body.requirements ?? "";

    const prompt = `
Workspace Document Compliance Check

Workspace: ${params.id}
Document: ${params.documentId}

Requirements:
${requirements}

Text:
${text}

Return JSON with:
- complianceScore
- violations
- missingElements
- recommendedFixes
`;

    console.log("CALLING OPENAI");

    const __aiGuard = await guardAIRequest(params.id, userId);
    if (__aiGuard) return __aiGuard;

    const result = await callUnifiedModel(prompt);

    console.log("OPENAI RESPONSE RECEIVED");

    return NextResponse.json({
      success: true,
      compliance: result,
    });
  } catch (error) {
    console.error(
      "COMPLIANCE API ERROR:",
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