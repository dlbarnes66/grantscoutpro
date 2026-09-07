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
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await context.params;

    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        billing: true,
        addons: true,
        addonBillings: true,
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const isOwner = workspace.ownerId === userId;
    const isAdmin = await prisma.workspaceMember.findFirst({
      where: { workspaceId: id, userId, role: "admin" },
    });

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      billing: workspace.billing,
      addons: workspace.addons,
      addonBillings: workspace.addonBillings,
      isOwner,
    });
  } catch (err: any) {
    console.error("WORKSPACE BILLING ROOT ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
