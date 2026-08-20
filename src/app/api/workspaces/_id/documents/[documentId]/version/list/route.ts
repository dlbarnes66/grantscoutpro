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
    const doc = await prisma.workspaceDocument.findUnique({
      where: { id: params.documentId },
      include: {
        workspace: { include: { members: true } },
      },
    });

    if (!doc || doc.workspaceId !== params.id) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const workspace = doc.workspace;

    const isMember =
      workspace.ownerId === userId ||
      workspace.members.some((m) => m.userId === userId);

    if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const versions = await prisma.documentVersion.findMany({
      where: {
        document: {
          id: params.documentId,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, versions });
  } catch (err: any) {
    console.error("VERSION LIST ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
