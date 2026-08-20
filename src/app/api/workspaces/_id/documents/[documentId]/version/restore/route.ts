import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { id: string; documentId: string };

export async function POST(
  req: NextRequest,
  { params }: { params: Params }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { versionId } = await req.json().catch(() => ({}));
  if (!versionId) {
    return NextResponse.json({ error: "Missing versionId" }, { status: 400 });
  }

  try {
    const version = await prisma.documentVersion.findUnique({
      where: { id: versionId },
      include: {
        document: {
          include: {
            workspace: { include: { members: true } },
          },
        },
      },
    });

    if (!version || version.document.id !== params.documentId) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    const workspace = version.document.workspace;

    const isOwner = workspace.ownerId === userId;
    const isAdmin = workspace.members.some((m) => m.userId === userId && m.role === "admin");

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const contentJson = version.content;
    const contentString =
      typeof contentJson === "string"
        ? contentJson
        : JSON.stringify(contentJson ?? "");

    const updated = await prisma.workspaceDocument.update({
      where: { id: params.documentId },
      data: { content: contentString },
    });

    await prisma.workspaceActivity.create({
      data: {
        workspaceId: params.id,
        userId,
        action: "document-version-restore",
        metadata: { documentId: params.documentId, versionId },
      },
    });

    return NextResponse.json({ success: true, document: updated });
  } catch (err: any) {
    console.error("VERSION RESTORE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
