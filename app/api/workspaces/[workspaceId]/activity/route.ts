import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceAccess } from "@/lib/auth/workspace-permissions";

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    await requireWorkspaceAccess(params.workspaceId);

    const activity = await prisma.workspaceActivity.findMany({
      where: { workspaceId: params.workspaceId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ activity });
  } catch (error: any) {
    console.error("Activity feed error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
