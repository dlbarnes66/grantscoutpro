export {};
export function buildAlignmentMatrix(grant: any, profile: any) {
  const matrix = [];

  if (grant.requiredElements) {
    for (const element of grant.requiredElements) {
      matrix.push({
        keyword: element.keyword,
        weight: element.weight || 1,
        present: false,
        alignmentScore: 0,
      });
    }
  }

  return matrix;
}
export function buildReviewerExpectations(grant: any) {
  const expectations = [];

  if (grant.reviewerNotes) {
    for (const note of grant.reviewerNotes) {
      expectations.push({
        description: note.description,
        priority: note.priority || "medium",
      });
    }
  }

  return expectations;
}
export function buildComplianceRules(grant: any) {
  const rules = [];

  if (grant.prohibitedContent) {
    for (const item of grant.prohibitedContent) {
      rules.push({
        description: item.description,
        pattern: item.pattern || item.keyword || "",
      });
    }
  }

  return rules;
}
export function buildRiskFlags(grant: any, profile: any) {
  const flags = [];

  if (grant.riskAreas) {
    for (const risk of grant.riskAreas) {
      flags.push({
        description: risk.description,
        severity: risk.severity || "medium",
      });
    }
  }

  return flags;
}
export function buildReadiness(grant: any, profile: any) {
  let level = "unknown";

  if (profile.experienceYears >= 5) level = "high";
  else if (profile.experienceYears >= 2) level = "medium";
  else level = "low";

  return {
    level,
    details: {
      experienceYears: profile.experienceYears || 0,
      pastAwards: profile.pastAwards || 0,
    },
  };
}
export function buildGrantIntelligence(grant: any, profile: any) {
  return {
    alignmentMatrix: buildAlignmentMatrix(grant, profile),
    reviewerExpectations: buildReviewerExpectations(grant),
    complianceRules: buildComplianceRules(grant),
    riskFlags: buildRiskFlags(grant, profile),
    readiness: buildReadiness(grant, profile),
  };
}
