import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || !body.type) {
      return NextResponse.json(
        { error: "Invalid AI event payload." },
        { status: 400 }
      );
    }

    const {
      type,
      workspaceId,
      documentId,
      userId,
      tokensUsed,
      latencyMs,
      error,
      metadata
    } = body;

    // --- BASIC VALIDATION ---
    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required." },
        { status: 400 }
      );
    }

    // --- LOG INTO INTERNAL AI EVENT TABLE ---
    await prisma.aiEventLog.create({
      data: {
        workspaceId,
        documentId,
        userId,
        type,
        tokensUsed: tokensUsed ?? 0,
        latencyMs: latencyMs ?? 0,
        error: error ?? null,
        metadata: metadata ?? {}
      }
    });

    // --- DOCUMENT ACTIVITY LOGGING ---
    if (documentId && ["ai_summarize", "ai_answer", "ai_improve"].includes(type)) {
      await prisma.workspaceDocumentActivity.create({
        data: {
          workspaceId,
          documentId,
          userId,
          type,
          description: `AI event: ${type}`
        }
      });
    }

    // --- BILLING TOKEN USAGE ---
    if (tokensUsed && tokensUsed > 0) {
      await prisma.workspaceBillingActivity.create({
        data: {
          workspaceId,
          userId: userId ?? null,
          action: "ai_usage",
          description: `AI tokens used: ${tokensUsed}`
        }
      });
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("AI Events Webhook error:", error);
    return NextResponse.json(
      { error: "Failed to process AI event." },
      { status: 500 }
    );
  }
}
