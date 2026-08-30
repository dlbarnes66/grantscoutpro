import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireWorkspaceMember } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { workspaceId: string } }) {
  const user = await requireUser();
  const { workspaceId } = params;

  await requireWorkspaceMember(workspaceId);

  const body = await req.json();

  const doc = await prisma.document.create({
    data: {
      workspaceId,
      userId: user.id,
      title: body.title || "Untitled Document",
      content: body.content || {}
    }
  });

  return NextResponse.json(doc);
}
