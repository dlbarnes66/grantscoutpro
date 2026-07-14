import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceRole } from "@/lib/auth/workspace-permissions";

export async function GET(req: Request, { params }: { params: { workspaceId: string } }) {
  try {
    await requireWorkspaceRole(params.workspaceId, ["ADMIN", "MEMBER"]);

    const documents = await prisma.document.findMany({
      where: { workspaceId: params.workspaceId },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, createdAt: true }
    });

    return NextResponse.json({ documents });
  } catch (error: any) {
    console.error("Documents fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { workspaceId: string } }) {
  try {
    await requireWorkspaceRole(params.workspaceId, ["ADMIN", "MEMBER"]);

    const { title, content, userId } = await req.json();

    const doc = await prisma.document.create({
      data: {
        workspaceId: params.workspaceId,
        userId,
        title: title ?? "Untitled Document",
        content: content ?? {}
      }
    });

    return NextResponse.json({ document: doc });
  } catch (error: any) {
    console.error("Document create error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
