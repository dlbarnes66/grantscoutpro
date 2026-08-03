// lib/grants/normalize/mergeGrantFields.ts

import { GrantSource } from "@prisma/client";

export interface RawGrant {
  title?: string;
  name?: string;
  opportunityTitle?: string;
  summary?: string;
  description?: string;

  agency?: string;
  agencyName?: string;
  department?: string;
  foundationName?: string;

  category?: string;
  fundingCategory?: string;
  programType?: string;
  givingAreas?: string | string[];

  deadline?: string;
  postedDate?: string;
  updatedDate?: string;

  amountMin?: number;
  awardFloor?: number;
  minGrant?: number;

  amountMax?: number;
  awardCeiling?: number;
  maxGrant?: number;

  totalFunding?: number;
  estimatedTotalProgramFunding?: number;

  eligibility?: any;
  eligibleApplicants?: string;
  ineligibleApplicants?: string;

  geographicFocus?: string;
  state?: string;
  region?: string;
  eligibleStates?: string;

  url?: string;
  website?: string;
  opportunityUrl?: string;

  ein?: string;
  mission?: string;
  restrictions?: string;
  pastGrantees?: any;
  boardMembers?: any;
  form990PF?: any;

  type?: string;
  focus?: string;
  history?: any;
}

export function mergeGrantFields(raw: RawGrant, source: GrantSource) {
  return {
    source,

    title: raw.title || raw.name || raw.opportunityTitle || "Untitled Grant",
    summary: raw.summary || raw.description || null,
    description: raw.description || null,

    agency:
      raw.agency ||
      raw.agencyName ||
      raw.department ||
      raw.foundationName ||
      raw.name ||
      null,

    category:
      raw.category ||
      raw.fundingCategory ||
      raw.programType ||
      (Array.isArray(raw.givingAreas)
        ? raw.givingAreas.join(", ")
        : raw.givingAreas) ||
      null,

    deadline: raw.deadline ? new Date(raw.deadline) : null,
    postedDate: raw.postedDate ? new Date(raw.postedDate) : null,
    updatedDate: raw.updatedDate ? new Date(raw.updatedDate) : null,

    amountMin:
      raw.amountMin ??
      raw.awardFloor ??
      raw.minGrant ??
      null,

    amountMax:
      raw.amountMax ??
      raw.awardCeiling ??
      raw.maxGrant ??
      null,

    totalFunding:
      raw.totalFunding ??
      raw.estimatedTotalProgramFunding ??
      null,

    eligibility: raw.eligibility || raw.eligibleApplicants || null,
    eligibleApplicants: raw.eligibleApplicants || null,
    ineligibleApplicants: raw.ineligibleApplicants || null,

    geographicFocus:
      raw.geographicFocus ||
      raw.state ||
      raw.region ||
      "United States",

    eligibleStates: raw.eligibleStates || raw.state || null,

    url: raw.url || raw.website || raw.opportunityUrl || null,

    foundationName: raw.foundationName || raw.name || null,
    foundationEIN: raw.ein || null,
    foundationMission: raw.mission || null,
    foundationRestrictions: raw.restrictions || null,
    foundationGivingAreas:
      Array.isArray(raw.givingAreas)
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
