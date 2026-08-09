import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  try {
    const params = await context.params;
    const body = await req.json().catch(() => ({}));
    const url = new URL(req.url);

    const documentId =
      params.documentId ||
      params.id ||
      body.documentId ||
      url.searchParams.get("documentId");

    const workspaceId =
      params.workspaceId ||
      body.workspaceId ||
      url.searchParams.get("workspaceId");

    // ⭐ PLACEHOLDER: your AI review logic

    return NextResponse.json({
      success: true,
      method: "POST",
      documentId,
      workspaceId,
      body,
    });
  } catch (err: any) {
    console.error("AI REVIEW ERROR:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
