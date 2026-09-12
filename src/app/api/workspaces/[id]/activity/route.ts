import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = Promise<{ id: string }>;

// Real workspace activity feed, backed by WorkspaceActivity - the same
// table logActivity() (src/lib/ai/activity-log.ts) already writes to from
// workspace creation, invites, member/profile changes, integrations, and
// every billing event in the Stripe webhook. This route used to be a
// stub that returned activity: "placeholder" and never touched the
// database - see the Workspace Activity page for the other half of that.
export async function GET(req: NextRequest, { params }: { params: Params }) {
  try {
    const { id: workspaceId } = await params;
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: { where: { status: "active" } } },
    });
    if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

    const isMember =
      workspace.ownerId === userId || workspace.members.some((m) => m.userId === userId);
    if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const activity = await prisma.workspaceActivity.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, activity });
  } catch (err: any) {
    console.error("WORKSPACE ACTIVITY GET ERROR:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
