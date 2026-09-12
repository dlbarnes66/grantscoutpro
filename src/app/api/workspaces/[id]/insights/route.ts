import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardAIRequest } from "@/lib/ai/guardAIRequest";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

async function requireMember(workspaceId: string, userId: string | null | undefined) {
  if (!userId) return { workspace: null, isMember: false };
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { members: true },
  });
  if (!workspace) return { workspace: null, isMember: false };
  const isMember = workspace.ownerId === userId || workspace.members.some((m) => m.userId === userId);
  return { workspace, isMember };
}

// GET: the workspace's insight history, newest first.
export async function GET(
  _req: NextRequest,
  { params: paramsPromise }: { params: Promise<Params> }
) {
  const params = await paramsPromise;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { workspace, isMember } = await requireMember(params.id, userId);
    if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const insights = await prisma.workspaceInsightLog.findMany({
      where: { workspaceId: params.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ success: true, insights });
  } catch (err: any) {
    console.error("WORKSPACE INSIGHTS GET ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: gather real workspace stats (grants, pipeline, documents, recent
// activity, search usage) and ask the model for a short momentum summary,
// then save it so it shows up in the history above.
export async function POST(
  _req: NextRequest,
  { params: paramsPromise }: { params: Promise<Params> }
) {
  const params = await paramsPromise;
  const { userId } = await auth();

  const guardResponse = await guardAIRequest(params.id, userId);
  if (guardResponse) return guardResponse;

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.id },
      include: { billing: true, _count: { select: { members: true, documents: true } } },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [grantStats, topGrants, dealsByStage, recentActivityCount] = await Promise.all([
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
        select: { title: true, aiCompetitivenessScore: true },
      }),
      prisma.crmDeal.groupBy({
        by: ["stage"],
        where: { workspaceId: params.id },
        _count: { _all: true },
        _sum: { amount: true },
      }),
      prisma.workspaceActivity.count({
        where: { workspaceId: params.id, createdAt: { gte: sevenDaysAgo } },
      }),
    ]);

    const openPipelineValue = dealsByStage
      .filter((d) => d.stage !== "won" && d.stage !== "lost")
      .reduce((sum, d) => sum + (d._sum.amount || 0), 0);
    const wonValue = dealsByStage.find((d) => d.stage === "won")?._sum.amount || 0;
    const totalDeals = dealsByStage.reduce((sum, d) => sum + d._count._all, 0);

    const stats = {
      grantsTracked: grantStats._count._all,
      averageScores: {
        alignment: grantStats._avg.aiAlignmentScore,
        competitiveness: grantStats._avg.aiCompetitivenessScore,
        readiness: grantStats._avg.aiReadinessScore,
        eligibility: grantStats._avg.aiEligibilityScore,
      },
      topGrants: topGrants.map((g) => ({ title: g.title, competitivenessScore: g.aiCompetitivenessScore })),
      pipeline: { totalDeals, openPipelineValue, wonValue },
      documentCount: workspace._count.documents,
      memberCount: workspace._count.members,
      searchesThisPeriod: workspace.billing?.usageSearches ?? 0,
      activityLast7Days: recentActivityCount,
    };

    const prompt = `
You are a grant-strategy analyst producing a short internal snapshot for a nonprofit's team. Given this workspace's current stats, write a 2-4 sentence plain-text summary of their grant-seeking momentum, noting anything notably strong, weak, or worth acting on. Do not use markdown formatting.

Stats:
${JSON.stringify(stats, null, 2)}
`;

    const summary = await callUnifiedModel(prompt);

    const insight = await prisma.workspaceInsightLog.create({
      data: {
        workspaceId: params.id,
        summary,
        metadata: stats,
      },
    });

    return NextResponse.json({ success: true, insight });
  } catch (err: any) {
    console.error("WORKSPACE INSIGHTS POST ERROR:", err);
    return NextResponse.json({ error: err.message || "Failed to generate insight." }, { status: 500 });
  }
}
