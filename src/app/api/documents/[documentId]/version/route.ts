import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireWorkspaceMember } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { workspaceId: string, documentId: string } }) {
  const user = await requireUser();
  const { workspaceId, documentId } = params;

  await requireWorkspaceMember(workspaceId);

  const versions = await prisma.documentVersion.findMany({
    where: { docId: documentId },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(versions);
}
