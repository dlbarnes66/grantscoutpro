import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceRole } from "@/lib/auth/workspace-permissions";

export async function GET(req: Request, { params }: { params: { workspaceId: string; documentId: string } }) {
  try {
    await requireWorkspaceRole(params.workspaceId, ["ADMIN", "MEMBER"]);

    const versions = await prisma.documentVersion.findMany({
      where: { docId: params.documentId },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ versions });
  } catch (error: any) {
    console.error("Document versions fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { workspaceId: string; documentId: string } }) {
  try {
    await requireWorkspaceRole(params.workspaceId, ["ADMIN", "MEMBER"]);

    const { userId, content } = await req.json();

    const version = await prisma.documentVersion.create({
      data: { docId: params.documentId, userId, content }
    });

    return NextResponse.json({ version });
  } catch (error: any) {
    console.error("Document version create error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
