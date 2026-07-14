import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceRole } from "@/lib/auth/workspace-permissions";

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    await requireWorkspaceRole(params.workspaceId, ["ADMIN", "MEMBER"]);

    const analytics = await prisma.searchAnalytics.findMany({
      where: { workspaceId: params.workspaceId },
      orderBy: [
        { count: "desc" },
        { lastSearchedAt: "desc" }
      ],
      take: 50,
    });

    return NextResponse.json({ analytics });
  } catch (error: any) {
    console.error("Search analytics error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
