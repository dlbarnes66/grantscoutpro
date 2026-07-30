import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await context.params;
    const { title, content, userId } = await request.json();

    if (!title || !userId) {
      return NextResponse.json(
        { error: "Missing title or userId" },
        { status: 400 }
      );
    }

    const doc = await prisma.workspaceDocument.create({
      data: {
        workspaceId,
        title,
        content: content ?? null
      }
    });

    await prisma.documentAccess.create({
      data: {
        documentId: doc.id,
        userId,
        canView: true,
        canEdit: true,
        canRunAI: false
      }
    });

    return NextResponse.json({ success: true, document: doc });
  } catch (err: any) {
    console.error("WORKSPACE DOCUMENT CREATE ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
