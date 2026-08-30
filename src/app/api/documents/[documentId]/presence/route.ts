import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireWorkspaceMember } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { workspaceId: string, documentId: string } }) {
  const user = await requireUser();
  const { workspaceId, documentId } = params;

  await requireWorkspaceMember(workspaceId);

  const body = await req.json();

  const presence = await prisma.documentPresence.upsert({
    where: {
      documentId_userId: {
        documentId,
        userId: user.id
      }
    },
    update: {
      status: body.status || "online",
      lastSeen: new Date()
    },
    create: {
      documentId,
      userId: user.id,
      status: body.status || "online"
    }
  });

  return NextResponse.json(presence);
}
