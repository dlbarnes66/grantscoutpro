import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
const {
  text = "",
  grant = {},
  profile = {},
  alignmentMatrix = {},
  reviewerExpectations = [],
  complianceRules = [],
  eligibilityCriteria = [],
  riskFlags = [],
  readiness = {},
} = body;
if (!text || text.trim().length === 0) {
  return NextResponse.json(
    { error: "Missing text to edit" },
    { status: 400 }
  );
}
const violations = [];

for (const rule of complianceRules) {
  if (rule.pattern && text.toLowerCase().includes(rule.pattern.toLowerCase())) {
    violations.push(rule);
  }
}
const eligibilityGaps = [];

for (const criterion of eligibilityCriteria) {
  if (!text.toLowerCase().includes(criterion.keyword.toLowerCase())) {
    eligibilityGaps.push(criterion);
  }
}
const instructions = {
  enforceCompliance: true,
  enforceEligibility: true,
  preserveMeaningWhenStrong: true,
  rewriteWhenNonCompliant: true,
  addMissingEligibilityElements: eligibilityGaps.length > 0,
  fixComplianceViolations: violations.length > 0,
  enhanceReviewerAppeal: reviewerExpectations.length > 0,
  reduceRiskFlags: riskFlags.length > 0,
  readinessLevel: readiness.level || "unknown",
};
const prompt = `
You are a senior grant compliance editor. Enforce all constraints, eligibility rules, and compliance requirements.
Use full grant intelligence: grant requirements, eligibility criteria, alignment matrix, reviewer expectations, compliance rules, risk flags, and readiness scoring.

TEXT TO FIX:
"${text}"

COMPLIANCE RULES:
${JSON.stringify(complianceRules, null, 2)}

ELIGIBILITY CRITERIA:
${JSON.stringify(eligibilityCriteria, null, 2)}

ALIGNMENT MATRIX:
${JSON.stringify(alignmentMatrix, null, 2)}

USER PROFILE:
${JSON.stringify(profile, null, 2)}

REVIEWER EXPECTATIONS:
${JSON.stringify(reviewerExpectations, null, 2)}

RISK FLAGS:
${JSON.stringify(riskFlags, null, 2)}

READINESS:
${JSON.stringify(readiness, null, 2)}

INSTRUCTIONS:
${JSON.stringify(instructions, null, 2)}

OUTPUT REQUIREMENTS:
1. If changes are small (minor compliance fixes), return improvedText only.
2. If changes are major (eligibility gaps, compliance violations, added required elements), return:
   - improvedText
   - changesMade (list)
   - reasons (list)
3. Preserve meaning unless compliance or eligibility requires rewriting.
4. If missing eligibility elements were added, explain why.
`;
const improvedText = text + " [CONSTRAINTS FIXED]";
const majorChanges =
  violations.length > 0 ||
  eligibilityGaps.length > 0;
if (!majorChanges) {
  return NextResponse.json({
    success: true,
    mode: "silent",
    improvedText,
  });
}
const changesMade = [];
const reasons = [];

for (const rule of violations) {
  changesMade.push(`Fixed compliance violation: ${rule.description}`);
  reasons.push(
    `The text violated a compliance rule: ${rule.description}. It has been corrected.`
  );
}

for (const criterion of eligibilityGaps) {
  changesMade.push(`Added missing eligibility element: ${criterion.keyword}`);
  reasons.push(
    `The grant requires eligibility element "${criterion.keyword}" but it was missing from the text.`
  );
}

return NextResponse.json({
  success: true,
  mode: "explanation",
  improvedText,
  changesMade,
  reasons,
});
}
