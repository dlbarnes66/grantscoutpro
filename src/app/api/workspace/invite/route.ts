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

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Missing email" },
        { status: 400 }
      );
    }

    // Find the user being invited
    const invitedUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!invitedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create membership
    await prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: invitedUser.id,
        role: "member",
      },
    });

    return NextResponse.json({
      success: true,
      invitedUserId: invitedUser.id,
      workspaceId,
    });
  } catch (err: any) {
    console.error("WORKSPACE INVITE ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
