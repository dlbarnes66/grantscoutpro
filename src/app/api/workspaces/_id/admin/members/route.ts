import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

export async function GET(
  _req: NextRequest,
  { params }: { params: Params }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.id },
      include: {
        members: { include: { user: true } },
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const me =
      workspace.ownerId === userId
        ? { role: "owner" }
        : workspace.members.find((m) => m.userId === userId);

    if (!me || (me.role !== "owner" && me.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const members = workspace.members.map((m) => ({
      id: m.id,
      userId: m.userId,
      email: m.user.email,
      role: m.role,
      status: m.status,
      createdAt: m.createdAt,
    }));

    return NextResponse.json({ success: true, members });
  } catch (err: any) {
    console.error("WORKSPACE ADMIN MEMBERS GET ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Params }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.id },
      include: { members: true },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const me =
      workspace.ownerId === userId
        ? { role: "owner" }
        : workspace.members.find((m) => m.userId === userId);

    if (!me || (me.role !== "owner" && me.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.userId || !body.action) {
      return NextResponse.json({ error: "Missing userId or action" }, { status: 400 });
    }

    if (!["deactivate", "activate"].includes(body.action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const status = body.action === "deactivate" ? "inactive" : "active";

    const updated = await prisma.workspaceMember.update({
      where: {
        workspaceId_userId: {
          workspaceId: params.id,
          userId: body.userId,
        },
      },
      data: {
        status,
      },
    });

    return NextResponse.json({ success: true, updated });
  } catch (err: any) {
    console.error("WORKSPACE ADMIN MEMBERS POST ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
