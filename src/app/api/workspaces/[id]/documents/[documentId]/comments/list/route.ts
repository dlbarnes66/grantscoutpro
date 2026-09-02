import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { id: string; documentId: string };

export async function GET(
  _req: Request,
  { params }: { params: Params }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const document = await prisma.workspaceDocument.findUnique({
      where: { id: params.documentId },
      include: {
        workspace: { include: { members: true } },
      },
    });

    if (!document || document.workspaceId !== params.id) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const workspace = document.workspace;

    const isMember =
      workspace.ownerId === userId ||
      workspace.members.some((m) => m.userId === userId);

    if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const comments = await prisma.documentComment.findMany({
      where: { documentId: params.documentId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, comments });
  } catch (err: any) {
    console.error("COMMENTS LIST ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
