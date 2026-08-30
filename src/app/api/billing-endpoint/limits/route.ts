import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const workspace = await prisma.workspace.findFirst({
      where: { orgId },
      include: {
        billing: true,
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    const billing = workspace.billing;

    let trialDaysRemaining = null;
    let trialBannerColor = null;
    let trialLocked = false;

    if (workspace.trialActive && workspace.trialEnd) {
      const now = new Date();
      const end = new Date(workspace.trialEnd);
      const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      trialDaysRemaining = diff;

      if (diff <= 10 && diff > 5) trialBannerColor = "yellow";
      else if (diff <= 5 && diff > 2) trialBannerColor = "orange";
      else if (diff <= 2 && diff >= 0) trialBannerColor = "red";

      if (diff < 0) {
        trialLocked = true;

        await prisma.workspace.update({
          where: { id: workspace.id },
          data: {
            trialActive: false,
            trialLocked: true,
            subscriptionTier: "basic",
          },
        });
      }
    }

    return NextResponse.json({
      plan: billing?.plan ?? "basic",
      seats: billing?.seats ?? 1,
      usage: {
        searches: billing?.usageSearches ?? 0,
        uploads: billing?.usageUploads ?? 0,
        members: billing?.usageMembers ?? 1,
        ai: billing?.usageAI ?? 0,
      },
      limits: {
        documents: billing?.documentLimit ?? 100,
        storageMb: billing?.storageLimitMb ?? 500,
        aiTokensMonthly: billing?.aiTokensMonthly ?? 50000,
      },
      trial: {
        active: workspace.trialActive,
        locked: trialLocked,
        daysRemaining: trialDaysRemaining,
        bannerColor: trialBannerColor,
      },
      stripe: {
        customerId: billing?.stripeCustomerId,
        subscriptionId: billing?.stripeSubscriptionId,
      },
    });
  } catch (err) {
    console.error("LIMITS ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
