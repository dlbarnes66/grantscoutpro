import { GrantSource, GrantTierAccess } from "@prisma/client";

export function normalizeStateGrant(raw: any) {
  return {
    source: GrantSource.STATE,
    tierAccess: GrantTierAccess.FEDERAL_STATE,

    title: raw.title || raw.name || "Untitled State Grant",
    summary: raw.summary || raw.description || null,
    description: raw.description || null,

    agency: raw.agency || raw.department || raw.stateAgency || null,
    category: raw.category || raw.programType || null,

    deadline: raw.deadline ? new Date(raw.deadline) : null,
    postedDate: raw.postedDate ? new Date(raw.postedDate) : null,
    updatedDate: raw.updatedDate ? new Date(raw.updatedDate) : null,

    amountMin: raw.minAward || null,
    amountMax: raw.maxAward || null,
    totalFunding: raw.totalFunding || null,

    eligibility: raw.eligibility || null,
    eligibleApplicants: raw.eligibleApplicants || null,
    ineligibleApplicants: raw.ineligibleApplicants || null,

    geographicFocus: raw.state || raw.region || "State-Level",
    eligibleStates: raw.state || null,

    url: raw.url || raw.link || null,

    raw,
  };
}
