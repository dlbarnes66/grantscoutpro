// app/api/team/add/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { workspaceId, email, role } = await req.json();

    if (!workspaceId || !email) {
      return NextResponse.json(
        { success: false, error: "Missing workspaceId or email" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if already a member
    const existing = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: user.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "User is already a workspace member" },
        { status: 400 }
      );
    }

    // Create workspace member
    await prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: user.id,
        role: role ?? "member",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("TEAM ADD ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add team member" },
      { status: 500 }
    );
  }
}
