// lib/grants/foundations/normalizeFoundation.ts

import { GrantSource, GrantTierAccess } from "@prisma/client";
import { FoundationRaw } from "./fetchFoundations";

export interface NormalizedFoundationGrant {
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

  geographicFocus: string | null;
  eligibleStates: string | null;

  url: string | null;

  foundationName: string | null;
  foundationEIN: string | null;
  foundationMission: string | null;
  foundationRestrictions: string | null;
  foundationGivingAreas: string | null;
  foundationPastGrantees: any | null;
  foundationBoardMembers: any | null;
  foundation990PF: any | null;

  philanthropicType: string | null;
  philanthropicFocus: string | null;
  philanthropicHistory: any | null;

  raw: FoundationRaw;
}

export function normalizeFoundation(raw: FoundationRaw): NormalizedFoundationGrant {
  return {
    id: raw.ein || raw.name || raw.foundationName || "UNKNOWN_FOUNDATION_ID",

    source: GrantSource.FOUNDATION,
    tierAccess: GrantTierAccess.PRO,

    title: raw.name || raw.foundationName || "Untitled Foundation Opportunity",
    summary: raw.summary || raw.description || null,
    description: raw.description || null,

    agency: raw.foundationName || raw.name || null,
    category: Array.isArray(raw.givingAreas)
      ? raw.givingAreas.join(", ")
      : raw.givingAreas || null,

    deadline: raw.deadline ? new Date(raw.deadline) : null,
    postedDate: raw.postedDate ? new Date(raw.postedDate) : null,
    updatedDate: raw.updatedDate ? new Date(raw.updatedDate) : null,

    amountMin: raw.minGrant ?? null,
    amountMax: raw.maxGrant ?? null,
    totalFunding: raw.totalFunding ?? null,

    eligibility: raw.eligibility || null,
    eligibleApplicants: raw.eligibleApplicants || null,
    ineligibleApplicants: raw.ineligibleApplicants || null,

    geographicFocus: raw.geographicFocus || null,
    eligibleStates: raw.eligibleStates || null,

    url: raw.url || raw.website || null,

    foundationName: raw.name || null,
    foundationEIN: raw.ein || null,
    foundationMission: raw.mission || null,
    foundationRestrictions: raw.restrictions || null,
    foundationGivingAreas: Array.isArray(raw.givingAreas)
      ? raw.givingAreas.join(", ")
      : raw.givingAreas || null,
    foundationPastGrantees: raw.pastGrantees || null,
    foundationBoardMembers: raw.boardMembers || null,
    foundation990PF: raw.form990PF || null,

    philanthropicType: raw.type || null,
    philanthropicFocus: raw.focus || null,
    philanthropicHistory: raw.history || null,

    raw,
  };
}
