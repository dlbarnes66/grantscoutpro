import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireWorkspaceMember } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { workspaceId: string, documentId: string } }) {
  const user = await requireUser();
  const { workspaceId, documentId } = params;

  await requireWorkspaceMember(workspaceId);

  const body = await req.json();

  const updated = await prisma.document.update({
    where: { id: documentId },
    data: {
      content: body.content,
      versions: {
        create: {
          docId: documentId,
          userId: user.id,
          content: body.content
        }
      }
    }
  });

  return NextResponse.json(updated);
}
