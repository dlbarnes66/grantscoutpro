import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = session.user.workspaceId;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        name: true,
        stripeCustomerId: true,
        trialEndsAt: true,
        createdAt: true,
        members: {
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ ok: true, workspace });
  } catch (err) {
    console.error("Workspace settings error:", err);
    return NextResponse.json(
      { error: "Failed to load workspace settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = session.user.workspaceId;
    const body = await req.json();

    const updated = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        name: body.name,
      },
    });

    return NextResponse.json({ ok: true, workspace: updated });
  } catch (err) {
    console.error("Workspace update error:", err);
    return NextResponse.json(
      { error: "Failed to update workspace" },
      { status: 500 }
    );
  }
}
