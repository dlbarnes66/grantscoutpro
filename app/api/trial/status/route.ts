import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = new URL(req.url).searchParams.get("workspaceId");
    if (!workspaceId) {
      return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId }
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const now = new Date();
    const trialEnds = workspace.trialEndsAt;

    let daysLeft = null;

    if (trialEnds) {
      const diff = trialEnds.getTime() - now.getTime();
      daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    return NextResponse.json({
      trialEndsAt: trialEnds,
      daysLeft,
      isLocked: workspace.isLocked
    });
  } catch (error) {
    console.error("Trial Status Error:", error);
    return NextResponse.json({ error: "Failed to fetch trial status" }, { status: 500 });
  }
}
