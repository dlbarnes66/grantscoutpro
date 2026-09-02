import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string; grantId: string };

export async function POST(
  req: NextRequest,
  { params }: { params: Params }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || !body.description) {
    return NextResponse.json({ error: "Missing description" }, { status: 400 });
  }

  try {
    const grant = await prisma.grant.findUnique({
      where: { id: params.grantId },
      include: {
        workspace: { include: { members: true } },
      },
    });

    if (!grant || grant.workspaceId !== params.id) {
      return NextResponse.json({ error: "Grant not found" }, { status: 404 });
    }

    const workspace = grant.workspace;

    const isOwner = workspace.ownerId === userId;
    const isAdmin = workspace.members.some((m) => m.userId === userId && m.role === "admin");

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.grant.update({
      where: { id: params.grantId },
      data: {
        description: body.description,
      },
    });

    return NextResponse.json({ success: true, grant: updated });
  } catch (err: any) {
    console.error("WORKSPACE GRANT EDITOR ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
