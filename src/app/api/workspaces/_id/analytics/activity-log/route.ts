import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

export async function GET(
  req: NextRequest,
  { params }: { params: Params }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const page = Number(req.nextUrl.searchParams.get("page") ?? 1);
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? 25);
  const skip = (page - 1) * limit;

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

    const logs = await prisma.workspaceActivity.findMany({
      where: { workspaceId: params.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const total = await prisma.workspaceActivity.count({
      where: { workspaceId: params.id },
    });

    return NextResponse.json({
      success: true,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      logs,
    });
  } catch (err: any) {
    console.error("WORKSPACE ACTIVITY LOG ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
