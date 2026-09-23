import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEffectivePlan, isManualSearchResetDue } from "@/lib/plans";
import { checkAiTokenBudget, recordAiTokenUsage } from "@/lib/ai/aiUsage";
import {
  runAgentGrantSearch,
  AGENT_CATEGORY_LABELS,
  type AgentSearchCategory,
} from "@/lib/grants/agent/searchBeyondProfile";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// A full run does 4 sequential Firecrawl searches (up to 20s each) plus
// up to 4 OpenAI extraction calls - comfortably past a default
// serverless timeout. See the same reasoning on
// /api/internal/grants/scan/route.ts (maxDuration 300, Vercel Pro).
export const maxDuration = 180;

type Params = { id: string };

async function loadWorkspaceForMember(workspaceId: string, userId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { billing: true, members: true, org: true },
  });

  if (!workspace) return { workspace: null, isMember: false };

  const isMember =
    workspace.ownerId === userId ||
    workspace.members.some((m) => m.userId === userId);

  return { workspace, isMember };
}

// Same atomic row-locked check-then-increment pattern as
// tryConsumeManualSearch in grants/search-now/route.ts, against the
// separate agentSearchCount/agentSearchResetAt counter.
async function tryConsumeAgentSearch(
  workspaceId: string,
  dailyLimit: number | null
): Promise<{ ok: boolean; used: number; resetAt: Date }> {
  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<
      { id: string; agentSearchCount: number; agentSearchResetAt: Date }[]
    >`SELECT "id", "agentSearchCount", "agentSearchResetAt" FROM "WorkspaceBilling" WHERE "workspaceId" = ${workspaceId} FOR UPDATE`;

    let row = rows[0];
    if (!row) {
      const created = await tx.workspaceBilling.create({ data: { workspaceId } });
      row = {
        id: created.id,
        agentSearchCount: created.agentSearchCount,
        agentSearchResetAt: created.agentSearchResetAt,
      };
    }

    let used = row.agentSearchCount;
    let resetAt = row.agentSearchResetAt;

    if (isManualSearchResetDue(resetAt)) {
      used = 0;
      resetAt = new Date();
    }

    if (dailyLimit !== null && used >= dailyLimit) {
      return { ok: false, used, resetAt };
    }

    used += 1;

    await tx.workspaceBilling.update({
      where: { id: row.id },
      data: { agentSearchCount: used, agentSearchResetAt: resetAt },
    });

    return { ok: true, used, resetAt };
  });
}

async function loadOwnerProfile(ownerId: string) {
  return prisma.userProfile.findUnique({ where: { userId: ownerId } });
}

// Status endpoint: tells the UI whether to show the button at all
// (organizationType === "For-Profit" only) and today's usage, without
// consuming anything or running a search. Safe to poll on page load.
export async function GET(
  _req: NextRequest,
  context: { params: Promise<Params> }
) {
  const params = await context.params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspace, isMember } = await loadWorkspaceForMember(params.id, userId);
  if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const profile = await loadOwnerProfile(workspace.ownerId);
  const eligible = profile?.organizationType === "For-Profit";

  const plan = getEffectivePlan(workspace);
  let used = workspace.billing?.agentSearchCount ?? 0;
  let resetAt = workspace.billing?.agentSearchResetAt ?? new Date();

  if (isManualSearchResetDue(resetAt)) {
    used = 0;
    resetAt = new Date();
  }

  return NextResponse.json({
    eligible,
    plan: plan.id,
    limit: plan.agentSearchesPerDay,
    used,
    remaining:
      plan.agentSearchesPerDay === null
        ? null
        : Math.max(plan.agentSearchesPerDay - used, 0),
    resetAt,
  });
}

// Runs the live web-research agent: 4 categories (for-profit,
// minority-owned, veteran-owned, women-owned), each a real Firecrawl
// search + OpenAI extraction pass, gated to for-profit workspaces and
// a separate, much lower daily allowance than the federal manual
// search (see tryConsumeAgentSearch above).
export async function POST(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  const params = await context.params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspace, isMember } = await loadWorkspaceForMember(params.id, userId);
  if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const profile = await loadOwnerProfile(workspace.ownerId);
  if (!profile) {
    return NextResponse.json(
      { error: "Complete your organization profile before running this search." },
      { status: 400 }
    );
  }
  if (profile.organizationType !== "For-Profit") {
    return NextResponse.json(
      {
        error:
          "This search is for for-profit workspaces - it looks for minority/veteran/women-owned and other for-profit business funding, which a nonprofit organization generally isn't eligible for.",
      },
      { status: 403 }
    );
  }

  const plan = getEffectivePlan(workspace);
  const consumption = await tryConsumeAgentSearch(workspace.id, plan.agentSearchesPerDay);

  if (!consumption.ok) {
    return NextResponse.json(
      {
        error: `Your ${plan.name} plan is limited to ${plan.agentSearchesPerDay} agent search${
          plan.agentSearchesPerDay === 1 ? "" : "es"
        } per day. Try again after ${consumption.resetAt.toISOString()}, or upgrade your plan.`,
        resetAt: consumption.resetAt,
      },
      { status: 429 }
    );
  }

  const budget = await checkAiTokenBudget(workspace.id);
  if (budget && !budget.allowed) {
    return NextResponse.json(
      {
        error: `Your workspace has used its AI budget for this billing period (resets ${budget.nextResetAt.toDateString()}). This search needs AI capacity to run.`,
      },
      { status: 429 }
    );
  }

  let outcome;
  try {
    outcome = await runAgentGrantSearch(profile);
  } catch (err: any) {
    console.error("AGENT GRANT SEARCH ERROR:", err);
    return NextResponse.json({ error: "Agent search failed unexpectedly." }, { status: 500 });
  }

  if (outcome.tokensUsed > 0) {
    await recordAiTokenUsage(workspace.id, outcome.tokensUsed);
  }

  let newCount = 0;
  const byCategory: Record<string, number> = {};

  for (const item of outcome.results) {
    byCategory[item.category] = (byCategory[item.category] || 0) + 1;

    const existing = await prisma.grant.findFirst({
      where: { workspaceId: workspace.id, url: item.url },
      select: { id: true },
    });

    const data = {
      workspaceId: workspace.id,
      title: item.title,
      agency: item.funder ?? undefined,
      category: AGENT_CATEGORY_LABELS[item.category as AgentSearchCategory],
      status: "open",
      summary: [item.summary, item.amountText ? `Award: ${item.amountText}.` : null, item.deadlineText ? `Deadline/cycle: ${item.deadlineText}.` : null]
        .filter(Boolean)
        .join(" "),
      eligibleApplicants: item.eligibleApplicants ?? undefined,
      url: item.url,
      raw: item as any,
    };

    if (existing) {
      await prisma.grant.update({ where: { id: existing.id }, data });
    } else {
      await prisma.grant.create({ data });
      newCount += 1;
    }
  }

  await prisma.workspaceNotification.create({
    data: {
      workspaceId: workspace.id,
      userId,
      type: "grant_agent_search",
      message:
        newCount > 0
          ? `Agent search found ${newCount} new for-profit/minority/veteran/women-owned funding program${newCount === 1 ? "" : "s"}.`
          : "Agent search ran - no new programs found this time.",
    },
  });

  return NextResponse.json({
    success: true,
    newGrants: newCount,
    totalResults: outcome.results.length,
    byCategory,
    errors: outcome.errors,
    searchesRemainingToday:
      plan.agentSearchesPerDay === null
        ? null
        : Math.max(plan.agentSearchesPerDay - consumption.used, 0),
    resetAt: consumption.resetAt,
  });
}
