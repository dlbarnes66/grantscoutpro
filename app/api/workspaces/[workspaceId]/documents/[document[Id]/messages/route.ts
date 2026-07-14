import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceRole } from "@/lib/auth/workspace-permissions";

export async function GET(req: Request, { params }: { params: { workspaceId: string; documentId: string } }) {
  try {
    await requireWorkspaceRole(params.workspaceId, ["ADMIN", "MEMBER"]);

    const messages = await prisma.documentMessage.findMany({
      where: { documentId: params.documentId },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error("Document messages fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { workspaceId: string; documentId: string } }) {
  try {
    await requireWorkspaceRole(params.workspaceId, ["ADMIN", "MEMBER"]);

    const { userId, message } = await req.json();

    const created = await prisma.documentMessage.create({
      data: { documentId: params.documentId, userId, message }
    });

    return NextResponse.json({ message: created });
  } catch (error: any) {
    console.error("Document message create error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
