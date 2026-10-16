import { prisma } from "@/lib/prisma";
import { resolveOrganizationType } from "@/lib/grants/orgType";
import type { FederalFormsInput } from "@/lib/documents/generatePdf";
import { formatUsDate, projectDates, sanitizeWorkPlan } from "@/lib/ai/workPlan";

type GrantForForms = {
  title: string;
  agency: string | null;
  category: string | null;
  summary: string | null;
  awardFloor: number | null;
  awardCeiling: number | null;
  opportunityNumber: string | null;
  cfdaNumber: string | null;
  raw: unknown;
  source: string | null;
};

/**
 * Builds the input for the auto-filled SF-424 family from the workspace
 * owner's Grant Profile. Federal grants only - returns null for state and
 * foundation grants. Shared by the package PDF route and the full bundle
 * route so both fill the forms identically.
 */
export async function buildFederalFormsInput(
  workspaceId: string,
  grant: GrantForForms,
  application: { budget: unknown; content?: string | null }
): Promise<FederalFormsInput | null> {
  if (grant.source !== "FEDERAL") return null;

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { ownerId: true, organizationTypeOverride: true },
  });
  const profile = workspace
    ? await prisma.userProfile.findUnique({ where: { userId: workspace.ownerId } })
    : null;
  const budgetTotal = (application.budget as any)?.total;
  const requestedAmount =
    typeof budgetTotal === "number" ? budgetTotal : grant.awardCeiling ?? grant.awardFloor ?? 0;

  // Project dates and the areas affected come from the package itself.
  let workPlan = null;
  try {
    workPlan = application.content ? sanitizeWorkPlan(JSON.parse(application.content)?.workPlan) : null;
  } catch {
    workPlan = null;
  }
  const dates = projectDates(workPlan);
  const areas = (profile?.geographicService || []).join(", ") || [profile?.city, profile?.state].filter(Boolean).join(", ");

  return {
    project: {
      startDate: formatUsDate(dates.start),
      endDate: formatUsDate(dates.end),
      applicantContribution: 0, // filled from the budget match when the PDF is drawn
      areasAffected: areas || null,
      quarterlyFederal: null, // filled from the cash-flow plan when the PDF is drawn
    },
    profile: {
      // The legal name (as registered with the IRS / SAM.gov) is what
      // belongs on SF-424 item 8a; fall back to the display name.
      organizationName: profile?.legalName?.trim() || profile?.organizationName || null,
      organizationType:
        resolveOrganizationType(
          { organizationTypeOverride: workspace?.organizationTypeOverride ?? null },
          profile
        ) ?? null,
      ein: profile?.ein ?? null,
      uei: profile?.uei ?? null,
      streetAddress: profile?.streetAddress ?? null,
      addressLine2: profile?.addressLine2 ?? null,
      city: profile?.city ?? null,
      state: profile?.state ?? null,
      zipCode: profile?.zipCode ?? null,
      county: profile?.county ?? null,
      country: profile?.country ?? null,
      orgPhone: profile?.orgPhone ?? null,
      congressionalDistrictApplicant: profile?.congressionalDistrictApplicant ?? null,
      congressionalDistrictProject: profile?.congressionalDistrictProject ?? null,
      authorizedRepName: profile?.authorizedRepName ?? null,
      authorizedRepTitle: profile?.authorizedRepTitle ?? null,
      authorizedRepPhone: profile?.authorizedRepPhone ?? null,
      authorizedRepEmail: profile?.authorizedRepEmail ?? null,
      geographicService: profile?.geographicService ?? null,
      eo12372Status: profile?.eo12372Status ?? null,
      federalDebtDelinquent: profile?.federalDebtDelinquent ?? null,
    },
    grant: {
      title: grant.title,
      agency: grant.agency,
      category: grant.category,
      summary: grant.summary,
      awardFloor: grant.awardFloor,
      awardCeiling: grant.awardCeiling,
      opportunityNumber: grant.opportunityNumber,
      cfdaNumber: grant.cfdaNumber,
      raw: grant.raw as any,
    },
    requestedAmount,
  };
}
