export function normalizeGrant(raw: any) {
  return {
    source: raw.source ?? "unknown",
    title: raw.title ?? raw.name ?? "Untitled Grant",
    summary: raw.summary ?? raw.shortDescription ?? "",
    description: raw.description ?? raw.fullDescription ?? "",
    agency: raw.agency ?? raw.funder ?? "",
    category: raw.category ?? raw.programType ?? "",
    status: raw.status ?? "unknown",

    financial: {
      amount: raw.financial?.amount ?? raw.amount ?? null,
      amountMin: raw.financial?.amountMin ?? raw.minAward ?? null,
      amountMax: raw.financial?.amountMax ?? raw.maxAward ?? null,
      totalFunding: raw.financial?.totalFunding ?? raw.totalFunding ?? null,
      awardFloor: raw.financial?.awardFloor ?? null,
      awardCeiling: raw.financial?.awardCeiling ?? null,
      expectedAwards: raw.financial?.expectedAwards ?? null,
    },

    dates: {
      deadline: raw.dates?.deadline ?? raw.deadline ?? null,
      openDate: raw.dates?.openDate ?? raw.openDate ?? null,
      postedDate: raw.dates?.postedDate ?? raw.postedDate ?? null,
      updatedDate: raw.dates?.updatedDate ?? raw.updatedDate ?? null,
    },

    eligibility: {
      industry: raw.eligibility?.industry ?? raw.industry ?? null,
      location: raw.eligibility?.location ?? raw.location ?? null,
      eligibleStates: raw.eligibility?.eligibleStates ?? null,
      geographicFocus: raw.eligibility?.geographicFocus ?? null,
      eligibleApplicants: raw.eligibility?.eligibleApplicants ?? null,
      ineligibleApplicants: raw.eligibility?.ineligibleApplicants ?? null,
      eligibilityJson: raw.eligibility ?? null,
    },

    foundation: {
      foundationName: raw.foundation?.name ?? null,
      foundationMission: raw.foundation?.mission ?? null,
      foundationRestrictions: raw.foundation?.restrictions ?? null,
      foundationGivingAreas: raw.foundation?.givingAreas ?? null,
      foundationPastGrantees: raw.foundation?.pastGrantees ?? null,
      foundationBoardMembers: raw.foundation?.boardMembers ?? null,
      foundation990PF: raw.foundation?.form990PF ?? null,
    },

    philanthropy: {
      philanthropicType: raw.philanthropy?.type ?? null,
      philanthropicFocus: raw.philanthropy?.focus ?? null,
      philanthropicHistory: raw.philanthropy?.history ?? null,
    },

    sections: (raw.sections ?? []).map((s: any, idx: number) => ({
      title: s.title ?? `Section ${idx + 1}`,
      content: s.content ?? "",
      order: s.order ?? idx,
    })),

    documents: (raw.documents ?? []).map((d: any) => ({
      filename: d.filename ?? d.name ?? "Document",
      url: d.url ?? "",
    })),

    raw,
  };
}
