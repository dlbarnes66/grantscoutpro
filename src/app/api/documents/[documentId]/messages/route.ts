import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireWorkspaceMember } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { workspaceId: string, documentId: string } }) {
  const user = await requireUser();
  const { workspaceId, documentId } = params;

  await requireWorkspaceMember(workspaceId);

  const messages = await prisma.documentMessage.findMany({
    where: { documentId },
    orderBy: { createdAt: "asc" }
  });

  return NextResponse.json(messages);
}

export async function POST(req: Request, { params }: { params: { workspaceId: string, documentId: string } }) {
  const user = await requireUser();
  const { workspaceId, documentId } = params;

  await requireWorkspaceMember(workspaceId);

  const body = await req.json();

  const msg = await prisma.documentMessage.create({
    data: {
      documentId,
      userId: user.id,
      message: body.message || ""
    }
  });

  return NextResponse.json(msg);
}
