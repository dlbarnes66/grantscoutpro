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

    const body = await req.json().catch(() => ({}));

    const text = body.text ?? body.content ?? "";

    const prompt = `
Grant Document Risk Mitigation Analysis

Workspace: ${params.id}
Document: ${params.documentId}

Text:
${text}

Identify the key risks in this proposal and, for each one, propose a concrete mitigation strategy. Return JSON with:
- risks (array of { risk, severity, mitigation })
- priorityActions (top 3 mitigations to act on first)
- contingencyPlans
- residualRiskSummary
`;

    const __aiGuard = await guardAIRequest(params.id, userId);
    if (__aiGuard) return __aiGuard;

    const result = await callUnifiedModel(prompt);

    return NextResponse.json({
      success: true,
      riskMitigation: result,
    });
  } catch (error) {
    console.error("RISK MITIGATION ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}
