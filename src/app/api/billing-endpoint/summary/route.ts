import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUsageLimits } from "@/lib/billing/usage-limits";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { workspaceId } = await req.json();
    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId required" },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        plan: true,
        billingStatus: true,
        billingPeriod: true,
        billingRenewalDate: true,
        workspaceBilling: {
          select: {
            usageSearches: true,
            usageUploads: true,
            usageMembers: true,
            usageAI: true,
            periodStart: true,
            periodEnd: true,
          },
        },
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    const limits = getUsageLimits(workspace.plan);

    return NextResponse.json({
      workspaceId,
      plan: workspace.plan,
      status: workspace.billingStatus,
      period: workspace.billingPeriod,
      renewal: workspace.billingRenewalDate,
      usage: workspace.workspaceBilling,
      limits,
    });
  } catch (err: any) {
    console.error("billing summary error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
