export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";



export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized: No user session" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Your User model does NOT contain workspaceId.
    // So we fetch the workspace via WorkspaceMember.
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId },
      select: { workspaceId: true, role: true },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "No workspace membership found" },
        { status: 403 }
      );
    }

    const workspaceId = membership.workspaceId;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        name: true,
        slug: true,
        trialStart: true,
        trialEnd: true,
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      workspace,
    });
  } catch (err: any) {
    console.error("WORKSPACE SETTINGS ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
