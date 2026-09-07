import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

export async function GET(
  _req: Request,
  context: { params: Promise<Params> }
) {
  const params = await context.params;
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

    const recent = await prisma.searchHistory.findMany({
      where: { userId: { in: memberIds } },
      orderBy: { createdAt: "desc" },
      take: 25,
    });

    const topQueries = await prisma.searchHistory.groupBy({
      by: ["query"],
      where: { userId: { in: memberIds } },
      _count: { query: true },
      orderBy: { _count: { query: "desc" } },
      take: 10,
    });

    const totalSearches = await prisma.searchHistory.count({
      where: { userId: { in: memberIds } },
    });

    return NextResponse.json({
      success: true,
      totalSearches,
      recent,
      topQueries,
    });
  } catch (err: any) {
    console.error("WORKSPACE SEARCH ANALYTICS ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
