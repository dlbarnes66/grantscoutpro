import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceRole } from "@/lib/auth/workspace-permissions";
import { generateAdminSummary } from "@/lib/workspace/generateAdminSummary";

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    // ⭐ Admin-only access
    await requireWorkspaceRole(params.workspaceId, ["admin"]);

    const workspaceId = params.workspaceId;

    const summary = await generateAdminSummary(workspaceId);

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: true },
    });

    const billing = await prisma.workspaceBilling.findUnique({
      where: { workspaceId },
    });

    const usage = {
      searches: billing?.usageSearches || 0,
      uploads: billing?.usageUploads || 0,
      members: billing?.usageMembers || 0,
      ai: billing?.usageAI || 0,
    };

    const activity = await prisma.workspaceActivity.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const insights = await prisma.workspaceInsight.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      summary,
      members,
      billing,
      usage,
      activity,
      insights,
    });
  } catch (error: any) {
    console.error("Admin console error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
