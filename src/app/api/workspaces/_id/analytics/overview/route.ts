import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

export async function GET(
  _req: Request,
  { params }: { params: Params }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.id },
      include: { members: true },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const isOwner = workspace.ownerId === userId;
    const isAdmin = workspace.members.some((m) => m.userId === userId && m.role === "admin");
    const isMember = workspace.members.some((m) => m.userId === userId);

    if (!isMember && !isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const memberIds = [workspace.ownerId, ...workspace.members.map((m) => m.userId)];

    const [documentsCount, grantsCount, searchesCount, activityCount] = await Promise.all([
      prisma.document.count({ where: { workspaceId: params.id } }).catch(() => 0),
      prisma.grant.count({ where: { workspaceId: params.id } }).catch(() => 0),
      prisma.searchHistory.count({ where: { userId: { in: memberIds } } }).catch(() => 0),
      prisma.workspaceActivity.count({ where: { workspaceId: params.id } }).catch(() => 0),
    ]);

    const overview = {
      documents: documentsCount,
      grants: grantsCount,
      members: workspace.members.length + 1, // + owner
      searches: searchesCount,
      activityEvents: activityCount,
      lastUpdated: workspace.updatedAt,
    };

    return NextResponse.json({ success: true, overview });
  } catch (err: any) {
    console.error("WORKSPACE ANALYTICS OVERVIEW ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
