import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

export async function GET(
  _req: NextRequest,
  { params: paramsPromise }: { params: Promise<Params> }
) {
  const params = await paramsPromise;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.id },
      include: { members: { include: { user: true } } },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const isMember =
      workspace.ownerId === userId ||
      workspace.members.some((m) => m.userId === userId);

    if (!isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, members: workspace.members });
  } catch (err: any) {
    console.error("WORKSPACE MEMBERS GET ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<Params> }
) {
  const params = await paramsPromise;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.id },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (workspace.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const member = await prisma.workspaceMember.create({
      data: {
        workspaceId: params.id,
        userId: body.userId,
        role: body.role || "member",
      },
    });

    return NextResponse.json({ success: true, member });
  } catch (err: any) {
    console.error("WORKSPACE MEMBERS POST ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
