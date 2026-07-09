import { GrantSource, GrantTierAccess } from "@prisma/client";

export function normalizeFederalGrant(raw: any) {
  return {
    source: GrantSource.FEDERAL,
    tierAccess: GrantTierAccess.FEDERAL_ONLY,

    title: raw.title || raw.opportunityTitle || "Untitled Federal Grant",
    summary: raw.summary || raw.description || null,
    description: raw.description || null,

    agency: raw.agency || raw.agencyName || null,
    category: raw.category || raw.fundingCategory || null,

    deadline: raw.closeDate ? new Date(raw.closeDate) : null,
    postedDate: raw.postedDate ? new Date(raw.postedDate) : null,
    updatedDate: raw.lastUpdatedDate ? new Date(raw.lastUpdatedDate) : null,

    amountMin: raw.awardFloor || null,
    amountMax: raw.awardCeiling || null,
    totalFunding: raw.estimatedTotalProgramFunding || null,

    eligibility: raw.eligibility || raw.eligibleApplicants || null,
    eligibleApplicants: raw.eligibleApplicants || null,
    ineligibleApplicants: raw.ineligibleApplicants || null,

    geographicFocus: "United States",
    eligibleStates: "ALL",

    url: raw.url || raw.opportunityUrl || null,

    raw,
  };
}
