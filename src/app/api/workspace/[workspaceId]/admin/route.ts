import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await context.params;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing workspaceId" },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId }
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: true
      }
    });

    return NextResponse.json({
      success: true,
      users: members
    });
  } catch (err: any) {
    console.error("WORKSPACE ADMIN ROUTE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
