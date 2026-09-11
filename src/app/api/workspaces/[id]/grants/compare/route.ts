import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

export async function POST(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<Params> }
) {
  const params = await paramsPromise;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.grantIds)) {
    return NextResponse.json({ error: "Missing grantIds" }, { status: 400 });
  }

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
        id: { in: body.grantIds },
        workspaceId: params.id,
      },
    });

    const comparison = grants.map((g) => ({
      id: g.id,
      title: g.title,
      agency: g.agency,
      category: g.category,
      status: g.status,
      // you can later add scoring fields if your schema has them
    }));

    return NextResponse.json({ success: true, comparison });
  } catch (err: any) {
    console.error("WORKSPACE GRANTS COMPARE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
