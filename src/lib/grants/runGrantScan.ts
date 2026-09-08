import { prisma } from "@/lib/prisma";
import { sendEmailSafe } from "@/lib/email/sendgrid";
import { grantMatchEmail } from "@/lib/email/templates";
import { rescanOrganizationWebsite } from "@/lib/ai/organizationScan";
import { scoreGrantMatch } from "@/lib/ai/grantMatch";
import { searchFederalGrants, grantsGovDetailUrl, GrantsGovConfigError, GrantsGovRequestError } from "@/lib/grantsGov";

// The twice-daily (or whatever schedule you point a cron at) job behind
// the notification bell: per workspace, refresh the owner's profile from
// their website, pull in fresh federal grants matching their focus
// areas, score any grants that haven't been scored recently, and notify
// (in-app + email) on strong new matches. This does NOT count against a
// workspace's manual-search daily limit - that's a separate, user-
// initiated allowance (see grants/search-now/route.ts).
//
// State/Foundation sources aren't wired into this scan - see
// src/lib/grants/state and src/lib/grants/foundations, which are still
// stub code pointed at placeholder URLs.

const MATCH_NOTIFY_THRESHOLD = Number(process.env.GRANT_MATCH_NOTIFY_THRESHOLD ?? 75);
const MAX_GRANTS_SCORED_PER_WORKSPACE = 15;

export type GrantScanResult = {
  workspacesScanned: number;
  websitesRescanned: number;
  grantsIngested: number;
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

export async function runGrantScan(): Promise<GrantScanResult> {
  const result: GrantScanResult = {
    workspacesScanned: 0,
    websitesRescanned: 0,
    grantsIngested: 0,
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
        await rescanOrganizationWebsite(workspace.ownerId);
        profile = await prisma.userProfile.findUnique({ where: { userId: workspace.ownerId } });
        result.websitesRescanned += 1;
      } catch (err: any) {
        result.errors.push(`Website rescan failed for workspace ${workspace.id}: ${err?.message || err}`);
      }
      if (!profile) continue;

      // 2. Pull in fresh federal grants matching the org's focus areas.
      const query = (profile.focusAreas && profile.focusAreas.length > 0 ? profile.focusAreas : ["nonprofit"]).join(" ");
      try {
        const opportunities = await searchFederalGrants(query);
        for (const opp of opportunities) {
          const url = grantsGovDetailUrl(opp.opportunity_id);
          const existing = await prisma.grant.findFirst({ where: { workspaceId: workspace.id, url }, select: { id: true } });
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
            result.grantsIngested += 1;
          }
        }
      } catch (err) {
        if (err instanceof GrantsGovConfigError || err instanceof GrantsGovRequestError) {
          result.errors.push(`Federal search failed for workspace ${workspace.id}: ${err.message}`);
        } else {
          throw err;
        }
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
        const match = await scoreGrantMatch(profile, grant);
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
      }
    } catch (err: any) {
      result.errors.push(`Workspace ${workspace.id} scan failed: ${err?.message || err}`);
    }
  }

  return result;
}
