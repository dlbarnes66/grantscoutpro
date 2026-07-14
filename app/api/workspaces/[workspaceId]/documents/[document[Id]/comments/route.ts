import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceRole } from "@/lib/auth/workspace-permissions";

export async function GET(req: Request, { params }: { params: { workspaceId: string; documentId: string } }) {
  try {
    await requireWorkspaceRole(params.workspaceId, ["ADMIN", "MEMBER"]);

    const comments = await prisma.documentComment.findMany({
      where: { documentId: params.documentId },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json({ comments });
  } catch (error: any) {
    console.error("Document comments fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { workspaceId: string; documentId: string } }) {
  try {
    await requireWorkspaceRole(params.workspaceId, ["ADMIN", "MEMBER"]);

    const { userId, text, selection } = await req.json();

    const created = await prisma.documentComment.create({
      data: { documentId: params.documentId, userId, text, selection }
    });

    return NextResponse.json({ comment: created });
  } catch (error: any) {
    console.error("Document comment create error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
