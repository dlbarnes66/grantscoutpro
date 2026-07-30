import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string; documentId: string }> }
) {
  try {
    const { workspaceId, documentId } = await context.params;

    if (!workspaceId || !documentId) {
      return NextResponse.json(
        { error: "Missing workspaceId or documentId" },
        { status: 400 }
      );
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      content: document.content ?? ""
    });
  } catch (err: any) {
    console.error("DOCUMENT GET ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
