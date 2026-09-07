import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

export async function GET(
  _req: NextRequest,
  context: { params: Promise<Params> }
) {
  const params = await context.params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.id },
      include: {
        members: { include: { user: true } },
        invites: true,
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const me =
      workspace.ownerId === userId
        ? { role: "owner" }
        : workspace.members.find((m) => m.userId === userId);

    if (!me || (me.role !== "owner" && me.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
      },
      members: workspace.members,
      invites: workspace.invites,
    });
  } catch (err: any) {
    console.error("WORKSPACE ADMIN OVERVIEW ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
