import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceAccess } from "@/lib/auth/workspace-permissions";

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    // ⭐ Any workspace member can view notifications
    await requireWorkspaceAccess(params.workspaceId);

    const notifications = await prisma.workspaceNotification.findMany({
      where: { workspaceId: params.workspaceId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ notifications });
  } catch (error: any) {
    console.error("Notifications error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    // ⭐ Mark all notifications as read
    await requireWorkspaceAccess(params.workspaceId);

    await prisma.workspaceNotification.updateMany({
      where: { workspaceId: params.workspaceId },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Mark read error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
