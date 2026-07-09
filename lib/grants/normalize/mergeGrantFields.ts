import { GrantSource } from "@prisma/client";

export function mergeGrantFields(raw: any, source: GrantSource) {
  return {
    source,

    // ⭐ Core fields
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
      raw.givingAreas ||
      null,

    // ⭐ Dates
    deadline: raw.deadline ? new Date(raw.deadline) : null,
    postedDate: raw.postedDate ? new Date(raw.postedDate) : null,
    updatedDate: raw.updatedDate ? new Date(raw.updatedDate) : null,

    // ⭐ Funding
    amountMin:
      raw.amountMin ||
      raw.awardFloor ||
      raw.minGrant ||
      null,

    amountMax:
      raw.amountMax ||
      raw.awardCeiling ||
      raw.maxGrant ||
      null,

    totalFunding:
      raw.totalFunding ||
      raw.estimatedTotalProgramFunding ||
      null,

    // ⭐ Eligibility
    eligibility: raw.eligibility || raw.eligibleApplicants || null,
    eligibleApplicants: raw.eligibleApplicants || null,
    ineligibleApplicants: raw.ineligibleApplicants || null,

    // ⭐ Geographic
    geographicFocus:
      raw.geographicFocus ||
      raw.state ||
      raw.region ||
      "United States",

    eligibleStates: raw.eligibleStates || raw.state || null,

    // ⭐ URLs
    url: raw.url || raw.website || raw.opportunityUrl || null,

    // ⭐ Foundation fields
    foundationName: raw.foundationName || raw.name || null,
    foundationEIN: raw.ein || null,
    foundationMission: raw.mission || null,
    foundationRestrictions: raw.restrictions || null,
    foundationGivingAreas: raw.givingAreas || null,
    foundationPastGrantees: raw.pastGrantees || null,
    foundationBoardMembers: raw.boardMembers || null,
    foundation990PF: raw.form990PF || null,

    // ⭐ Philanthropic fields
    philanthropicType: raw.type || null,
    philanthropicFocus: raw.focus || null,
    philanthropicHistory: raw.history || null,

    // ⭐ Raw storage
    raw,
  };
}
