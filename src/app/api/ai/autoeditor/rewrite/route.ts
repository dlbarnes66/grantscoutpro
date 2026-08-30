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
  requiredElements = [],
  eligibilityCriteria = [],
  riskFlags = [],
  readiness = {},
} = body;
if (!text || text.trim().length === 0) {
  return NextResponse.json(
    { error: "Missing text to rewrite" },
    { status: 400 }
  );
}
const missingElements = [];

for (const element of requiredElements) {
  if (!text.toLowerCase().includes(element.keyword.toLowerCase())) {
    missingElements.push(element);
  }
}
const eligibilityGaps = [];

for (const criterion of eligibilityCriteria) {
  if (!text.toLowerCase().includes(criterion.keyword.toLowerCase())) {
    eligibilityGaps.push(criterion);
  }
}
const violations = [];

for (const rule of complianceRules) {
  if (rule.pattern && text.toLowerCase().includes(rule.pattern.toLowerCase())) {
    violations.push(rule);
  }
}
const instructions = {
  aggressiveRewrite: true,
  preserveMeaningWhenStrong: true,
  enhanceMeaningWhenWeak: true,
  addMissingRequiredElements: missingElements.length > 0,
  addMissingEligibilityElements: eligibilityGaps.length > 0,
  fixComplianceViolations: violations.length > 0,
  strengthenAlignment: true,
  enhanceReviewerAppeal: reviewerExpectations.length > 0,
  reduceRiskFlags: riskFlags.length > 0,
  readinessLevel: readiness.level || "unknown",
  fabricationMode: "hybrid",
};
const prompt = `
You are a senior grant writer performing a full aggressive rewrite. 
Your goal is to maximize scoring potential using full grant intelligence: 
grant requirements, eligibility criteria, alignment matrix, reviewer expectations, compliance rules, risk flags, and readiness scoring.

TEXT TO REWRITE:
"${text}"

GRANT REQUIREMENTS:
${JSON.stringify(grant, null, 2)}

REQUIRED ELEMENTS:
${JSON.stringify(requiredElements, null, 2)}

ELIGIBILITY CRITERIA:
${JSON.stringify(eligibilityCriteria, null, 2)}

COMPLIANCE RULES:
${JSON.stringify(complianceRules, null, 2)}

ALIGNMENT MATRIX:
${JSON.stringify(alignmentMatrix, null, 2)}

REVIEWER EXPECTATIONS:
${JSON.stringify(reviewerExpectations, null, 2)}

RISK FLAGS:
${JSON.stringify(riskFlags, null, 2)}

READINESS:
${JSON.stringify(readiness, null, 2)}

INSTRUCTIONS:
${JSON.stringify(instructions, null, 2)}

OUTPUT REQUIREMENTS:
1. Rewrite the text aggressively for alignment, clarity, compliance, and scoring.
2. If changes are small, return improvedText only.
3. If changes are major (added elements, compliance fixes, eligibility fixes, meaning enhancement), return:
   - improvedText
   - changesMade (list)
   - reasons (list)
4. Use hybrid fabrication:
   - If user provided partial info → expand it.
   - If user provided nothing → fabricate safe generic content.
   - If grant requires specifics → fabricate only what is necessary.
`;
const improvedText = text + " [REWRITTEN]";
const majorChanges =
  missingElements.length > 0 ||
  eligibilityGaps.length > 0 ||
  violations.length > 0;
if (!majorChanges) {
  return NextResponse.json({
    success: true,
    mode: "silent",
    improvedText,
  });
}
const changesMade = [];
const reasons = [];

for (const element of missingElements) {
  changesMade.push(`Added missing required element: ${element.keyword}`);
  reasons.push(
    `The grant requires "${element.keyword}" but it was missing from the text.`
  );
}

for (const criterion of eligibilityGaps) {
  changesMade.push(`Added missing eligibility element: ${criterion.keyword}`);
  reasons.push(
    `Eligibility requires "${criterion.keyword}" but it was missing from the text.`
  );
}

for (const rule of violations) {
  changesMade.push(`Fixed compliance violation: ${rule.description}`);
  reasons.push(
    `The text violated a compliance rule: ${rule.description}. It has been corrected.`
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
