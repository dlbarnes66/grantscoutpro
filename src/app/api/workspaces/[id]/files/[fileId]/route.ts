import { auth } from "@clerk/nextjs/server";
import { del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = Promise<{ id: string; fileId: string }>;

// DELETE - remove a file from both Blob storage and the workspace's list.
export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  try {
    const { id: workspaceId, fileId } = await params;
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: { where: { status: "active" } } },
    });
    if (!workspace) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const isMember =
      workspace.ownerId === userId || workspace.members.some((m) => m.userId === userId);
    if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const file = await prisma.workspaceFile.findFirst({
      where: { id: fileId, workspaceId },
    });
    if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });

    try {
      await del(file.url);
    } catch (blobErr) {
      // The DB row is the source of truth for what the UI shows - if the
      // blob is already gone (or Blob storage hiccups), still remove the
      // row rather than leaving a permanently undeletable ghost entry.
      console.error("WORKSPACE FILES DELETE - blob delete failed, continuing:", blobErr);
    }

    await prisma.workspaceFile.delete({ where: { id: fileId } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("WORKSPACE FILES DELETE ERROR:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
