// lib/grants/federal/normalizeFederalGrant.ts

import { GrantSource, GrantTierAccess } from "@prisma/client";
import { FederalGrantRaw } from "./fetchFederalGrants";

export interface NormalizedFederalGrant {
  id: string;
  source: GrantSource;
  tierAccess: GrantTierAccess;

  title: string;
  summary: string | null;
  description: string | null;

  agency: string | null;
  category: string | null;

  deadline: Date | null;
  postedDate: Date | null;
  updatedDate: Date | null;

  amountMin: number | null;
  amountMax: number | null;
  totalFunding: number | null;

  eligibility: string | null;
  eligibleApplicants: string | null;
  ineligibleApplicants: string | null;

  geographicFocus: string;
  eligibleStates: string;

  url: string | null;

  raw: FederalGrantRaw;
}

export function normalizeFederalGrant(raw: FederalGrantRaw): NormalizedFederalGrant {
  return {
    id: raw.opportunityNumber || raw.title || "UNKNOWN_ID",

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

    amountMin: raw.awardFloor ?? null,
    amountMax: raw.awardCeiling ?? null,
    totalFunding: raw.estimatedTotalProgramFunding ?? null,

    eligibility: raw.eligibility || raw.eligibleApplicants || null,
    eligibleApplicants: raw.eligibleApplicants || null,
    ineligibleApplicants: raw.ineligibleApplicants || null,

    geographicFocus: "United States",
    eligibleStates: "ALL",

    url: raw.url || raw.opportunityUrl || null,

    raw,
  };
}
