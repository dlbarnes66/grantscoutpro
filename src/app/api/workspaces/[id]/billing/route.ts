import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

export async function GET(
  _req: NextRequest,
  { params }: { params: Params }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.id },
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
      where: { workspaceId: params.id, userId, role: "admin" },
    });

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      billing: workspace.billing,
      addons: workspace.addons,
      addonBillings: workspace.addonBillings,
    });
  } catch (err: any) {
    console.error("WORKSPACE BILLING ROOT ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
