export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";



export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
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

    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Missing name" },
        { status: 400 }
      );
    }

    const updated = await prisma.workspace.update({
      where: { id: workspaceId },
      data: { name },
    });

    return NextResponse.json({
      success: true,
      workspace: updated,
    });
  } catch (err: any) {
    console.error("WORKSPACE SETTINGS NAME ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
