import { GrantSource, GrantTierAccess } from "@prisma/client";

export function normalizeFoundation(raw: any) {
  return {
    source: GrantSource.FOUNDATION,
    tierAccess: GrantTierAccess.PRO, // Enterprise inherits PRO access

    title: raw.name || raw.foundationName || "Untitled Foundation Opportunity",
    summary: raw.summary || raw.description || null,
    description: raw.description || null,

    agency: raw.foundationName || raw.name || null,
    category: raw.givingAreas || null,

    deadline: raw.deadline ? new Date(raw.deadline) : null,
    postedDate: raw.postedDate ? new Date(raw.postedDate) : null,
    updatedDate: raw.updatedDate ? new Date(raw.updatedDate) : null,

    amountMin: raw.minGrant || null,
    amountMax: raw.maxGrant || null,
    totalFunding: raw.totalFunding || null,

    eligibility: raw.eligibility || null,
    eligibleApplicants: raw.eligibleApplicants || null,
    ineligibleApplicants: raw.ineligibleApplicants || null,

    geographicFocus: raw.geographicFocus || null,
    eligibleStates: raw.eligibleStates || null,

    url: raw.url || raw.website || null,

    // ⭐ Foundation-specific fields
    foundationName: raw.name || null,
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

    raw,
  };
}
