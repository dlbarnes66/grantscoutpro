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

    const type = body?.type ?? "outline";
    const prompt = body?.prompt ?? "";
    const content = body?.content ?? {};

    console.log(
      "SECTION GENERATOR ROUTE HIT",
      params.id,
      params.documentId,
      type
    );

    const aiPrompt = `
Grant Writing Section Generator

Workspace:
${params.id}

Document:
${params.documentId}

Section Type:
${type}

Custom Prompt:
${prompt}

Existing Content:
${JSON.stringify(content, null, 2)}

Generate a strong grant section.

Return JSON:

{
  "title": "",
  "content": ""
}
`;

    const __aiGuard = await guardAIRequest(params.id, userId);
    if (__aiGuard) return __aiGuard;

    const result = await callUnifiedModel(aiPrompt);

    console.log(
      "SECTION GENERATOR RESPONSE RECEIVED"
    );

    return NextResponse.json({
      success: true,
      output: result,
      message: `${type} section generated.`,
    });
  } catch (error) {
    console.error(
      "SECTION GENERATOR ERROR:",
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