import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { id: string; documentId: string };

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || !body.text)
    return NextResponse.json({ error: "Missing text" }, { status: 400 });

  const workspace = await prisma.workspace.findUnique({
    where: { id: params.id },
    include: { members: true },
  });

  if (!workspace)
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  const isMember =
    workspace.ownerId === userId ||
    workspace.members.some((m) => m.userId === userId);

  if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const message = await prisma.comment.create({
    data: {
      workspaceId: params.id,
      userId,
      message: body.text,
    },
  });

  return NextResponse.json({ success: true, message });
}
