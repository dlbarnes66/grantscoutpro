import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string; memberId: string }> }
) {
  try {
    const { workspaceId, memberId } = await context.params;

    const removed = await prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: memberId
        }
      }
    });

    return NextResponse.json({ success: true, removed });
  } catch (err: any) {
    console.error("WORKSPACE MEMBER DELETE ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
