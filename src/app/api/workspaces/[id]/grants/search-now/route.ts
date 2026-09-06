import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPlan, isManualSearchResetDue } from "@/lib/plans";
import {
  searchFederalGrants,
  grantsGovDetailUrl,
  GrantsGovConfigError,
  GrantsGovRequestError,
  type GrantsGovOpportunity,
} from "@/lib/grantsGov";

export const dynamic = "force-dynamic";

type Params = { id: string };

async function loadWorkspaceForMember(workspaceId: string, userId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { billing: true, members: true },
  });

  if (!workspace) return { workspace: null, isMember: false };

  const isMember =
    workspace.ownerId === userId ||
    workspace.members.some((m) => m.userId === userId);

  return { workspace, isMember };
}

// Returns today's manual-search allowance and how much of it is used,
// resetting the counter first if the 24h window has rolled over.
// Does not consume a search - safe to call to render a "3 of 5 used
// today" indicator in the UI.
export async function GET(
  _req: NextRequest,
  { params }: { params: Params }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspace, isMember } = await loadWorkspaceForMember(params.id, userId);
  if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const plan = getPlan(workspace.billing?.plan);
  let used = workspace.billing?.manualSearchCount ?? 0;
  let resetAt = workspace.billing?.manualSearchResetAt ?? new Date();

  if (isManualSearchResetDue(resetAt)) {
    used = 0;
    resetAt = new Date();
  }

  return NextResponse.json({
    plan: plan.id,
    limit: plan.manualSearchesPerDay,
    used,
    remaining:
      plan.manualSearchesPerDay === null
        ? null
        : Math.max(plan.manualSearchesPerDay - used, 0),
    resetAt,
  });
}

// Consumes one manual search (if the plan's daily allowance allows it),
// queries Grants.gov for federal opportunities, saves any new ones to
// this workspace's Grant table, and drops a notification.
export async function POST(
  req: NextRequest,
  { params }: { params: Params }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspace, isMember } = await loadWorkspaceForMember(params.id, userId);
  if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const plan = getPlan(workspace.billing?.plan);

  if (!plan.access.federal) {
    return NextResponse.json(
      { error: `Your ${plan.name} plan doesn't include grant search access.` },
      { status: 403 }
    );
  }

  let used = workspace.billing?.manualSearchCount ?? 0;
  let resetAt = workspace.billing?.manualSearchResetAt ?? new Date();

  if (isManualSearchResetDue(resetAt)) {
    used = 0;
    resetAt = new Date();
  }

  if (plan.manualSearchesPerDay !== null && used >= plan.manualSearchesPerDay) {
    return NextResponse.json(
      {
        error: `Your ${plan.name} plan is limited to ${plan.manualSearchesPerDay} manual search${
          plan.manualSearchesPerDay === 1 ? "" : "es"
        } per day. Try again after ${resetAt.toISOString()}, or upgrade your plan.`,
        resetAt,
      },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const query: string = typeof body.query === "string" ? body.query : "";

  let opportunities: GrantsGovOpportunity[] = [];
  try {
    opportunities = await searchFederalGrants(query);
  } catch (err) {
    if (err instanceof GrantsGovConfigError) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    if (err instanceof GrantsGovRequestError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    console.error("MANUAL GRANT SEARCH ERROR:", err);
    return NextResponse.json({ error: "Grant search failed unexpectedly." }, { status: 500 });
  }

  // Record the search attempt regardless of how many results came back,
  // so a zero-result search still counts against the daily allowance.
  used += 1;

  await prisma.workspaceBilling.upsert({
    where: { workspaceId: workspace.id },
    update: { manualSearchCount: used, manualSearchResetAt: resetAt },
    create: {
      workspaceId: workspace.id,
      manualSearchCount: used,
      manualSearchResetAt: resetAt,
    },
  });

  let newCount = 0;
  for (const opp of opportunities) {
    const url = grantsGovDetailUrl(opp.opportunity_id);

    const existing = await prisma.grant.findFirst({
      where: { workspaceId: workspace.id, url },
      select: { id: true },
    });

    const data = {
      workspaceId: workspace.id,
      title: opp.opportunity_title,
      agency: opp.agency_name ?? undefined,
      category: opp.funding_category ?? undefined,
      status: opp.opportunity_status ?? "open",
      summary: opp.summary ?? undefined,
      awardFloor: opp.award_floor ?? undefined,
      awardCeiling: opp.award_ceiling ?? undefined,
      totalFunding: opp.estimated_total_program_funding ?? undefined,
      expectedAwards: opp.expected_number_of_awards ?? undefined,
      deadline: opp.close_date ? new Date(opp.close_date) : undefined,
      openDate: opp.post_date ? new Date(opp.post_date) : undefined,
      url,
      raw: opp as any,
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
      type: "grant_search",
      message:
        newCount > 0
          ? `Manual search found ${newCount} new federal grant${newCount === 1 ? "" : "s"}.`
          : "Manual search ran - no new federal grants found.",
    },
  });

  return NextResponse.json({
    success: true,
    totalResults: opportunities.length,
    newGrants: newCount,
    searchesRemainingToday:
      plan.manualSearchesPerDay === null
        ? null
        : Math.max(plan.manualSearchesPerDay - used, 0),
    resetAt,
  });
}
