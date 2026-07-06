// app/api/team/remove/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { workspaceId, userId } = await req.json();

    if (!workspaceId || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing workspaceId or userId" },
        { status: 400 }
      );
    }

    // Delete membership
    await prisma.workspaceMember.deleteMany({
      where: {
        workspaceId,
        userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("TEAM REMOVE ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove team member" },
      { status: 500 }
    );
  }
}
