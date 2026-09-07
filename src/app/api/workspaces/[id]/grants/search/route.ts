import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

export async function GET(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  const params = await context.params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q") ?? "";

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.id },
      include: { members: true },
    });

    if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

    const isMember =
      workspace.ownerId === userId ||
      workspace.members.some((m) => m.userId === userId);

    if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const grants = await prisma.grant.findMany({
      where: {
        workspaceId: params.id,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { agency: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
          { tags: { has: q } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, grants });
  } catch (err: any) {
    console.error("WORKSPACE GRANTS SEARCH ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
