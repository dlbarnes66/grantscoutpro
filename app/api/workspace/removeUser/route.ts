// app/api/workspace/removeUser/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

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

    // Remove user from workspace
    await prisma.workspaceMember.deleteMany({
      where: {
        workspaceId,
        userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("REMOVE USER ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove user" },
      { status: 500 }
    );
  }
}
