// app/api/workspace/addUser/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { canAddUser } from "@/lib/userLimits";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { workspaceId, userId } = await req.json();

    if (!workspaceId || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing workspaceId or userId" },
        { status: 400 }
      );
    }

    // Check user limits
    const allowed = await canAddUser(workspaceId);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "User limit reached" },
        { status: 403 }
      );
    }

    // Add user to workspace
    await prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId,
        role: "member",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADD USER ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add user" },
      { status: 500 }
    );
  }
}
