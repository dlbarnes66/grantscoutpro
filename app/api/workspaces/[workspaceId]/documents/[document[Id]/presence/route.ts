import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceRole } from "@/lib/auth/workspace-permissions";

export async function GET(req: Request, { params }: { params: { workspaceId: string; documentId: string } }) {
  try {
    await requireWorkspaceRole(params.workspaceId, ["ADMIN", "MEMBER"]);

    const presence = await prisma.documentPresence.findMany({
      where: { documentId: params.documentId }
    });

    return NextResponse.json({ presence });
  } catch (error: any) {
    console.error("Document presence fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { workspaceId: string; documentId: string } }) {
  try {
    await requireWorkspaceRole(params.workspaceId, ["ADMIN", "MEMBER"]);

    const { userId } = await req.json();

    const updated = await prisma.documentPresence.upsert({
      where: {
        documentId_userId: {
          documentId: params.documentId,
          userId
        }
      },
      update: { lastSeen: new Date() },
      create: {
        documentId: params.documentId,
        userId,
        lastSeen: new Date()
      }
    });

    return NextResponse.json({ presence: updated });
  } catch (error: any) {
    console.error("Document presence update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
