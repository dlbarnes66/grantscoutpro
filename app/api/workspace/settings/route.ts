import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.workspaceId) {
      return NextResponse.json(
        { error: "Unauthorized: No workspace found in session" },
        { status: 401 }
      );
    }

    const workspaceId = session.user.workspaceId;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        name: true,
        trialEndsAt: true,
        members: {
          select: {
            id: true,
            email: true,
            role: true,
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

