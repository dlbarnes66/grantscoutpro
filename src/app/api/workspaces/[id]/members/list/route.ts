import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { _id: string } }
) {
  try {
    const user = await requireUser();
    const workspaceId = params._id;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required." },
        { status: 400 }
      );
    }

    // Ensure user is a member of the workspace
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: user.id,
      },
      select: { role: true },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You do not have access to this workspace." },
        { status: 403 }
      );
    }

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      orderBy: { role: "asc" }, // admins first
      select: {
        id: true,
        role: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            organization: true,
          },
        },
        createdAt: true,
      },
    });

    return NextResponse.json({ members }, { status: 200 });
  } catch (error: any) {
    console.error("Workspace members list error:", error);
    return NextResponse.json(
      { error: "Failed to load workspace members." },
      { status: 500 }
    );
  }
}
