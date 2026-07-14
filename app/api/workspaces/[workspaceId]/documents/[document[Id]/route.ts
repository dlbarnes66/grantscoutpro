import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceRole } from "@/lib/auth/workspace-permissions";

export async function GET(req: Request, { params }: { params: { workspaceId: string; documentId: string } }) {
  try {
    await requireWorkspaceRole(params.workspaceId, ["ADMIN", "MEMBER"]);

    const doc = await prisma.document.findUnique({
      where: { id: params.documentId },
      include: {
        patches: true,
        versions: true,
        snapshots: true,
        DocumentMessage: true,
        DocumentComment: true,
        DocumentPresence: true,
        Embedding: true,
        File: true,
        DocumentEmbedding: true
      }
    });

    if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

    return NextResponse.json({ document: doc });
  } catch (error: any) {
    console.error("Document fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { workspaceId: string; documentId: string } }) {
  try {
    await requireWorkspaceRole(params.workspaceId, ["ADMIN", "MEMBER"]);

    const { title, content } = await req.json();

    const updated = await prisma.document.update({
      where: { id: params.documentId },
      data: { title, content }
    });

    return NextResponse.json({ document: updated });
  } catch (error: any) {
    console.error("Document update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { workspaceId: string; documentId: string } }) {
  try {
    await requireWorkspaceRole(params.workspaceId, ["ADMIN", "MEMBER"]);

    await prisma.document.delete({ where: { id: params.documentId } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Document delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
