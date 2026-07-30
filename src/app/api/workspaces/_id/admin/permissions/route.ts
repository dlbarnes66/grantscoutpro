import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await context.params;
    const { userId, role } = await request.json();

    if (!workspaceId || !userId || !role) {
      return NextResponse.json(
        { error: "Missing workspaceId, userId, or role" },
        { status: 400 }
      );
    }

    const updated = await prisma.workspaceMember.update({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId
        }
      },
      data: { role }
    });

    return NextResponse.json({ success: true, updated });
  } catch (err: any) {
    console.error("WORKSPACE PERMISSIONS ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
