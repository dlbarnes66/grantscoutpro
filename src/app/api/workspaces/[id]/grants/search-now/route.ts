import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEffectivePlan, isManualSearchResetDue } from "@/lib/plans";
import {
  searchFederalGrants,
  grantsGovDetailUrl,
  stripHtml,
  GrantsGovConfigError,
  GrantsGovRequestError,
  type GrantsGovOpportunity,
} from "@/lib/grantsGov";

export const dynamic = "force-dynamic";

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

// Atomically consumes one manual search against the workspace's daily
// allowance, or refuses if it's already used up. Uses a row lock
// (SELECT ... FOR UPDATE) inside a transaction so concurrent requests
// against the same workspace serialize on the check-then-increment
// instead of racing: without this, two requests that both read the
// count before either had written it back could both pass the limit
// check and both proceed, so a limit of N could let through more than
// N searches (and N calls to the Grants.gov API) if fired
// concurrently. The row lock also means we know whether the request
// is allowed *before* paying for the external API call, not after.
async function tryConsumeManualSearch(
  workspaceId: string,
  dailyLimit: number | null
): Promise<{ ok: boolean; used: number; resetAt: Date }> {
  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<
      { id: string; manualSearchCount: number; manualSearchResetAt: Date }[]
    >`SELECT "id", "manualSearchCount", "manualSearchResetAt" FROM "WorkspaceBilling" WHERE "workspaceId" = ${workspaceId} FOR UPDATE`;

    let row = rows[0];
    if (!row) {
      const created = await tx.workspaceBilling.create({ data: { workspaceId } });
      row = {
        id: created.id,
        manualSearchCount: created.manualSearchCount,
        manualSearchResetAt: created.manualSearchResetAt,
      };
    }

    let used = row.manualSearchCount;
    let resetAt = row.manualSearchResetAt;

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
      // manualSearchCount is the daily rate-limit counter this function
      // exists to enforce; usageSearches is the separate period-level
      // stat shown on the Usage/Billing pages - nothing was incrementing
      // it, so it always read 0 there even for an active workspace.
      // Bumping it in the same transaction keeps both counters
      // consistent with the same atomic, lock-serialized write.
      data: { manualSearchCount: used, manualSearchResetAt: resetAt, usageSearches: { increment: 1 } },
    });

    return { ok: true, used, resetAt };
  });
}

// Returns today's manual-search allowance and how much of it is used,
// resetting the counter first if the 24h window has rolled over.
// Does not consume a search - safe to call to render a "3 of 5 used
// today" indicator in the UI.
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

  const plan = getEffectivePlan(workspace);
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
  context: { params: Promise<Params> }
) {
  const params = await context.params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspace, isMember } = await loadWorkspaceForMember(params.id, userId);
  if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const plan = getEffectivePlan(workspace);

  if (!plan.access.federal) {
    return NextResponse.json(
      { error: `Your ${plan.name} plan doesn't include grant search access.` },
      { status: 403 }
    );
  }

  const consumption = await tryConsumeManualSearch(workspace.id, plan.manualSearchesPerDay);

  if (!consumption.ok) {
    return NextResponse.json(
      {
        error: `Your ${plan.name} plan is limited to ${plan.manualSearchesPerDay} manual search${
          plan.manualSearchesPerDay === 1 ? "" : "es"
        } per day. Try again after ${consumption.resetAt.toISOString()}, or upgrade your plan.`,
        resetAt: consumption.resetAt,
      },
      { status: 429 }
    );
  }

  const { used, resetAt } = consumption;

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

  let newCount = 0;
  for (const opp of opportunities) {
    const url = grantsGovDetailUrl(opp.opportunity_id);

    const existing = await prisma.grant.findFirst({
      where: { workspaceId: workspace.id, url },
      select: { id: true },
    });

    // Most of the useful detail (deadline, award amounts, category,
    // description) lives under opp.summary, not at the top level -- see
    // the note in src/lib/grantsGov.ts.
    const s = opp.summary;

    const data = {
      workspaceId: workspace.id,
      title: opp.opportunity_title,
      agency: opp.agency_name ?? opp.top_level_agency_name ?? undefined,
      category: s?.funding_categories?.[0] ?? opp.category ?? undefined,
      status: opp.opportunity_status ?? "open",
      summary: stripHtml(s?.summary_description) ?? undefined,
      awardFloor: s?.award_floor ?? undefined,
      awardCeiling: s?.award_ceiling ?? undefined,
      totalFunding: s?.estimated_total_program_funding ?? undefined,
      expectedAwards: s?.expected_number_of_awards ?? undefined,
      deadline: s?.close_date ? new Date(s.close_date) : undefined,
      openDate: s?.post_date ? new Date(s.post_date) : undefined,
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
