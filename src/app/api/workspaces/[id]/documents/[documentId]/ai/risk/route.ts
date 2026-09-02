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
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const params = await context.params;

    const text =
      (await req.json().catch(() => ({}))).text ?? "";

    const prompt = `
Workspace Document Risk Analysis

Workspace: ${params.id}
Document: ${params.documentId}

Text:
${text}

Return JSON with:
- riskScore
- riskFactors
- vulnerabilities
- recommendedMitigation
`;

    const result = await callUnifiedModel(prompt);

    return NextResponse.json({
      success: true,
      risk: result,
    });
  } catch (error) {
    console.error("RISK API ERROR:", error);

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