import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceRole } from "@/lib/auth/workspace-permissions";

export async function GET(req: Request, { params }: { params: { workspaceId: string; documentId: string } }) {
  try {
    await requireWorkspaceRole(params.workspaceId, ["ADMIN", "MEMBER"]);

    const snapshots = await prisma.documentSnapshot.findMany({
      where: { docId: params.documentId },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ snapshots });
  } catch (error: any) {
    console.error("Document snapshots fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { workspaceId: string; documentId: string } }) {
  try {
    await requireWorkspaceRole(params.workspaceId, ["ADMIN", "MEMBER"]);

    const { userId, content } = await req.json();

    const snapshot = await prisma.documentSnapshot.create({
      data: { docId: params.documentId, userId, content }
    });

    return NextResponse.json({ snapshot });
  } catch (error: any) {
    console.error("Document snapshot create error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
