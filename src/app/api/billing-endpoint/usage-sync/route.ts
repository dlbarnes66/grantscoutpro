import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { workspaceId } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        billing: true,
      },
    });

    if (!workspace || !workspace.billing) {
      return NextResponse.json(
        { error: "Workspace or billing not found" },
        { status: 404 }
      );
    }

    const billing = workspace.billing;

    // Reset usage if billing period has rolled over
    const now = new Date();
    const periodEnd = billing.periodEnd;

    let reset = false;

    if (periodEnd && now > periodEnd) {
      reset = true;

      await prisma.workspaceBilling.update({
        where: { id: billing.id },
        data: {
          usageSearches: 0,
          usageUploads: 0,
          usageMembers: 0,
          usageAI: 0,
          aiTokensUsed: 0,
          periodStart: now,
          periodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    return NextResponse.json({
      synced: true,
      reset,
      usage: {
        searches: billing.usageSearches,
        uploads: billing.usageUploads,
        members: billing.usageMembers,
        ai: billing.usageAI,
      },
    });
  } catch (err) {
    console.error("USAGE SYNC ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
