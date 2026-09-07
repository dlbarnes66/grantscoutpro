import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";
import { guardAIRequest } from "@/lib/ai/guardAIRequest";

console.log("RISK ROUTE LOADED");

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

    console.log("RISK ROUTE HIT");
    console.log("WORKSPACE:", params.id);
    console.log("DOCUMENT:", params.documentId);

    const body = await req.json().catch(() => ({}));

    console.log("REQUEST BODY:", body);

    const text =
      body.text ??
      body.content ??
      "";

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

    console.log("CALLING OPENAI");

    const __aiGuard = await guardAIRequest(params.id, userId);
    if (__aiGuard) return __aiGuard;

    const result = await callUnifiedModel(prompt);

    console.log("OPENAI RESPONSE RECEIVED");

    return NextResponse.json({
      success: true,
      risk: result,
    });
  } catch (error) {
    console.error(
      "RISK API ERROR:",
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