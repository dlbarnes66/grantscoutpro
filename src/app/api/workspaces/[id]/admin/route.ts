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
        owner: { select: { name: true, email: true } },
        billing: true,
        members: { select: { userId: true, role: true, status: true } },
        _count: { select: { members: true, grants: true, documents: true } },
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const me =
      workspace.ownerId === userId
        ? { role: "owner" as const }
        : workspace.members.find((m) => m.userId === userId);

    if (!me || (me.role !== "owner" && me.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const activeMemberCount = workspace.members.filter((m) => m.status === "active").length;

    const [recentActivity, grantStats, topGrants] = await Promise.all([
      prisma.workspaceActivity.findMany({
        where: { workspaceId: params.id },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.grant.aggregate({
        where: { workspaceId: params.id },
        _count: { _all: true },
        _avg: {
          aiAlignmentScore: true,
          aiCompetitivenessScore: true,
          aiReadinessScore: true,
          aiEligibilityScore: true,
        },
      }),
      prisma.grant.findMany({
        where: { workspaceId: params.id, aiCompetitivenessScore: { not: null } },
        orderBy: { aiCompetitivenessScore: "desc" },
        take: 3,
        select: {
          id: true,
          title: true,
          aiCompetitivenessScore: true,
          aiAlignmentScore: true,
          aiSummary: true,
        },
      }),
    ]);

    const billing = workspace.billing;

    return NextResponse.json({
      success: true,
      summary: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        createdAt: workspace.createdAt,
        owner: workspace.owner,
        memberCount: workspace._count.members,
        activeMemberCount,
        documentCount: workspace._count.documents,
        grantsTracked: workspace._count.grants,
      },
      billing: billing
        ? {
            plan: billing.plan,
            status: billing.status,
            cancelAtPeriodEnd: billing.cancelAtPeriodEnd,
            hasStripeCustomer: Boolean(billing.stripeCustomerId),
            hasStripeSubscription: Boolean(billing.stripeSubscriptionId),
            periodStart: billing.periodStart,
            periodEnd: billing.periodEnd,
          }
        : { plan: "free", status: "none" },
      usage: billing
        ? {
            seats: { used: activeMemberCount, limit: billing.seats },
            searches: {
              usedThisPeriod: billing.usageSearches,
              manualToday: billing.manualSearchCount,
              manualResetAt: billing.manualSearchResetAt,
            },
            uploadsThisPeriod: billing.usageUploads,
            aiTokens: { used: billing.aiTokensUsed, limit: billing.aiTokensMonthly },
            documents: { count: workspace._count.documents, limit: billing.documentLimit },
            storageLimitMb: billing.storageLimitMb,
          }
        : null,
      activity: recentActivity.map((a) => ({
        id: a.id,
        action: a.action,
        metadata: a.metadata,
        createdAt: a.createdAt,
        user: a.user ? { name: a.user.name, email: a.user.email } : null,
      })),
      insights: {
        grantsScored: grantStats._count._all,
        averageScores: {
          alignment: grantStats._avg.aiAlignmentScore,
          competitiveness: grantStats._avg.aiCompetitivenessScore,
          readiness: grantStats._avg.aiReadinessScore,
          eligibility: grantStats._avg.aiEligibilityScore,
        },
        topGrants: topGrants.map((g) => ({
          id: g.id,
          title: g.title,
          competitivenessScore: g.aiCompetitivenessScore,
          alignmentScore: g.aiAlignmentScore,
          summary: g.aiSummary,
        })),
      },
    });
  } catch (err: any) {
    console.error("WORKSPACE ADMIN OVERVIEW ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
