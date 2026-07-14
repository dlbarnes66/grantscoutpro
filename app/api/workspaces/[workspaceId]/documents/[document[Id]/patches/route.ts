import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceRole } from "@/lib/auth/workspace-permissions";

export async function GET(req: Request, { params }: { params: { workspaceId: string; documentId: string } }) {
  try {
    await requireWorkspaceRole(params.workspaceId, ["ADMIN", "MEMBER"]);

    const patches = await prisma.documentPatch.findMany({
      where: { docId: params.documentId },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ patches });
  } catch (error: any) {
    console.error("Document patches fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { workspaceId: string; documentId: string } }) {
  try {
    await requireWorkspaceRole(params.workspaceId, ["ADMIN", "MEMBER"]);

    const { userId, patch } = await req.json();

    const created = await prisma.documentPatch.create({
      data: { docId: params.documentId, userId, patch }
    });

    return NextResponse.json({ patch: created });
  } catch (error: any) {
    console.error("Document patch create error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
