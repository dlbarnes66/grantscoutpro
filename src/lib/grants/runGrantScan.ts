import { prisma } from "@/lib/prisma";
import { sendEmailSafe } from "@/lib/email/sendgrid";
import { grantMatchEmail } from "@/lib/email/templates";
import { rescanOrganizationWebsite } from "@/lib/ai/organizationScan";
import { scoreGrantMatch } from "@/lib/ai/grantMatch";
import { searchFederalGrants, grantsGovDetailUrl, stripHtml, GrantsGovConfigError, GrantsGovRequestError } from "@/lib/grantsGov";
import { fetchStateGrants, type StateGrantRaw } from "@/lib/grants/state/fetchStateGrants";
import { fetchFoundations } from "@/lib/grants/foundations/fetchFoundations";

// The twice-daily (or whatever schedule you point a cron at) job behind
// the notification bell: per workspace, refresh the owner's profile from
// their website, pull in fresh grants matching their focus areas from
// every source we have (federal, state where we have a source configured,
// and foundation prospects), score anything that hasn't been scored yet,
// and notify (in-app + email) on strong new matches. This does NOT count
// against a workspace's manual-search daily limit - that's a separate,
// user-initiated allowance (see grants/search-now/route.ts).
//
// State coverage is intentionally narrow right now (see
// src/lib/grants/state/fetchStateGrants.ts - only AL and NC have a real
// source configured; every other state returns nothing until one is
// added). Foundation results are prospects sourced from IRS Form 990
// filings via ProPublica (see src/lib/grants/foundations/fetchFoundations.ts)
// - real organizations and real financials, but not live "open call for
// proposals" listings the way federal/state grants are, since no free
// source of those exists for foundations.

const MATCH_NOTIFY_THRESHOLD = Number(process.env.GRANT_MATCH_NOTIFY_THRESHOLD ?? 75);
const MAX_GRANTS_SCORED_PER_WORKSPACE = 15;

export type GrantScanResult = {
  workspacesScanned: number;
  websitesRescanned: number;
  grantsIngested: number;
  stateGrantsIngested: number;
  foundationsIngested: number;
  grantsScored: number;
  matchesNotified: number;
  errors: string[];
};

async function alreadyNotified(workspaceId: string, grantId: string): Promise<boolean> {
  const existing = await prisma.workspaceNotification.findFirst({
    where: { workspaceId, type: `grant_match:${grantId}` },
    select: { id: true },
  });
  return !!existing;
}

// Shared upsert-by-(workspace, url) used by every source below, so a
// re-run doesn't create duplicate rows for the same opportunity.
async function upsertGrantOpportunity(workspaceId: string, url: string, data: Record<string, any>): Promise<boolean> {
  const existing = await prisma.grant.findFirst({ where: { workspaceId, url }, select: { id: true } });
  if (existing) {
    await prisma.grant.update({ where: { id: existing.id }, data });
    return false;
  }
  await prisma.grant.create({ data: { workspaceId, url, ...data } as any });
  return true;
}

// State pages don't change several-times-a-day, and multiple workspaces
// can share a state - cache scrape results per run instead of re-scraping
// once per workspace.
const stateGrantCache = new Map<string, Promise<StateGrantRaw[]>>();
function getStateGrantsCached(stateCode: string): Promise<StateGrantRaw[]> {
  if (!stateGrantCache.has(stateCode)) {
    stateGrantCache.set(stateCode, fetchStateGrants(stateCode));
  }
  return stateGrantCache.get(stateCode)!;
}

// Firecrawl (used by both the website rescan and state-grant scraping
// below) and the OpenAI scoring calls have no built-in timeout, and a
// single slow or bot-blocking site can hang far longer than any
// reasonable function budget. Racing each slow external step against a
// hard deadline means one bad workspace can't starve every workspace
// behind it in the loop - it just gets logged as an error and the scan
// moves on, same as any other per-workspace failure already does.
async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}

export async function runGrantScan(): Promise<GrantScanResult> {
  const result: GrantScanResult = {
    workspacesScanned: 0,
    websitesRescanned: 0,
    grantsIngested: 0,
    stateGrantsIngested: 0,
    foundationsIngested: 0,
    grantsScored: 0,
    matchesNotified: 0,
    errors: [],
  };

  const workspaces = await prisma.workspace.findMany({
    select: { id: true, name: true, ownerId: true },
  });

  for (const workspace of workspaces) {
    result.workspacesScanned += 1;

    try {
      const owner = await prisma.user.findUnique({ where: { id: workspace.ownerId }, select: { email: true } });
      let profile = await prisma.userProfile.findUnique({ where: { userId: workspace.ownerId } });
      if (!profile?.website) continue; // nothing to match against yet

      // 1. Refresh the profile's picture of current projects from the
      // org's own website.
      try {
        await withTimeout(rescanOrganizationWebsite(workspace.ownerId), 45_000, "Website rescan");
        profile = await prisma.userProfile.findUnique({ where: { userId: workspace.ownerId } });
        result.websitesRescanned += 1;
      } catch (err: any) {
        result.errors.push(`Website rescan failed for workspace ${workspace.id}: ${err?.message || err}`);
      }
      if (!profile) continue;

      const query = (profile.focusAreas && profile.focusAreas.length > 0 ? profile.focusAreas : ["nonprofit"]).join(" ");

      // 2. Pull in fresh federal grants matching the org's focus areas.
      try {
        const opportunities = await searchFederalGrants(query);
        for (const opp of opportunities) {
          const url = grantsGovDetailUrl(opp.opportunity_id);
          const s = opp.summary;
          const created = await upsertGrantOpportunity(workspace.id, url, {
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
            raw: opp as any,
          });
          if (created) result.grantsIngested += 1;
        }
      } catch (err) {
        if (err instanceof GrantsGovConfigError || err instanceof GrantsGovRequestError) {
          result.errors.push(`Federal search failed for workspace ${workspace.id}: ${err.message}`);
        } else {
          throw err;
        }
      }

      // 2b. State grants - only does anything if we have a real source
      // configured for this workspace's state (see fetchStateGrants.ts).
      if (profile.state) {
        try {
          const stateGrants = await withTimeout(getStateGrantsCached(profile.state), 45_000, "State grant scrape");
          for (const g of stateGrants) {
            if (!g.url) continue;
            const created = await upsertGrantOpportunity(workspace.id, g.url, {
              title: g.title,
              agency: g.agency ?? `State of ${profile.state}`,
              category: g.category ?? undefined,
              status: "open",
              summary: g.summary ?? undefined,
              awardFloor: g.minAward ?? undefined,
              awardCeiling: g.maxAward ?? undefined,
              eligibleApplicants: g.eligibility ?? undefined,
              eligibleStates: profile.state,
              geographicFocus: profile.state,
              deadline: g.deadline ? new Date(g.deadline) : undefined,
              raw: g as any,
            });
            if (created) result.stateGrantsIngested += 1;
          }
        } catch (err: any) {
          result.errors.push(`State grant scan failed for workspace ${workspace.id}: ${err?.message || err}`);
        }
      }

      // 2c. Foundation prospects from IRS filings (ProPublica) - no
      // deadline, these are funders to research and reach out to, not
      // opportunities with an application window.
      try {
        const foundationQuery = profile.focusAreas?.[0] || profile.mission?.slice(0, 60) || query;
        const foundations = await fetchFoundations(foundationQuery, profile.state);
        for (const f of foundations) {
          if (!f.url || !f.name) continue;
          const filingNote =
            f.totalRevenue != null || f.totalAssets != null
              ? ` Most recent IRS filing${f.latestFilingYear ? ` (FY${f.latestFilingYear})` : ""}: ${
                  f.totalRevenue != null ? `revenue $${f.totalRevenue.toLocaleString()}` : "revenue unknown"
                }, ${f.totalAssets != null ? `assets $${f.totalAssets.toLocaleString()}` : "assets unknown"}.`
              : "";
          const created = await upsertGrantOpportunity(workspace.id, f.url, {
            title: f.name,
            agency: "Private Foundation (prospect)",
            category: f.nteeCode ? `NTEE ${f.nteeCode}` : "Foundation Prospect",
            status: "open",
            summary: `Prospective funder identified from IRS Form 990 filings, based in ${
              [f.city, f.state].filter(Boolean).join(", ") || "an unknown location"
            }.${filingNote} Not a live open call for proposals - research fit and reach out directly.`,
            geographicFocus: f.state ?? undefined,
            eligibleStates: f.state ?? undefined,
            foundationName: f.name,
            foundationEIN: f.ein ?? undefined,
            foundation990PF: {
              totalRevenue: f.totalRevenue ?? null,
              totalAssets: f.totalAssets ?? null,
              latestFilingYear: f.latestFilingYear ?? null,
            } as any,
            raw: f as any,
          });
          if (created) result.foundationsIngested += 1;
        }
      } catch (err: any) {
        result.errors.push(`Foundation prospecting failed for workspace ${workspace.id}: ${err?.message || err}`);
      }

      // 3. Score any open grants that haven't been scored yet, capped
      // per run to bound AI spend. There's no aiScoredAt column, and
      // Grant.updatedAt gets touched by the ingestion step above on
      // every run regardless of scoring, so it can't be used to detect
      // "scored too long ago" - re-scoring already-scored grants isn't
      // implemented yet (would need a dedicated timestamp column).
      const grantsToScore = await prisma.grant.findMany({
        where: {
          workspaceId: workspace.id,
          status: "open",
          aiEligibilityScore: null,
        },
        orderBy: { postedDate: "desc" },
        take: MAX_GRANTS_SCORED_PER_WORKSPACE,
      });

      for (const grant of grantsToScore) {
        try {
          const match = await withTimeout(scoreGrantMatch(profile, grant), 30_000, `Scoring "${grant.title}"`);
          result.grantsScored += 1;

          await prisma.grant.update({
            where: { id: grant.id },
            data: {
              aiEligibilityScore: match.score,
              aiSummary: match.rationale,
              aiRecommendations: { whatsNeeded: match.whatsNeeded },
            },
          });

          if (match.score >= MATCH_NOTIFY_THRESHOLD && !(await alreadyNotified(workspace.id, grant.id))) {
            await prisma.workspaceNotification.create({
              data: {
                workspaceId: workspace.id,
                userId: workspace.ownerId,
                type: `grant_match:${grant.id}`,
                message: `${grant.title} scored ${match.score}/100 against your profile.`,
              },
            });
            result.matchesNotified += 1;

            if (owner?.email) {
              await sendEmailSafe({
                to: owner.email,
                ...grantMatchEmail({
                  grantTitle: grant.title,
                  score: match.score,
                  workspaceName: workspace.name,
                  workspaceId: workspace.id,
                  grantId: grant.id,
                  deadline: grant.deadline ? new Date(grant.deadline).toDateString() : null,
                }),
              });
            }
          }
        } catch (err: any) {
          result.errors.push(`Scoring failed for grant ${grant.id} (workspace ${workspace.id}): ${err?.message || err}`);
        }
      }
    } catch (err: any) {
      result.errors.push(`Workspace ${workspace.id} scan failed: ${err?.message || err}`);
    }
  }

  return result;
}
