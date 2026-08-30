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
  riskFlags = [],
  readiness = {},
} = body;
if (!text || text.trim().length === 0) {
  return NextResponse.json(
    { error: "Missing text to edit" },
    { status: 400 }
  );
}
const requiredElements = grant.requiredElements || [];
const eligibilityCriteria = grant.eligibility || [];
const missingElements = [];

for (const element of requiredElements) {
  if (!text.toLowerCase().includes(element.keyword.toLowerCase())) {
    missingElements.push(element);
  }
}
const instructions = {
  improveClarity: true,
  improveReadability: true,
  preserveMeaningWhenStrong: true,
  strengthenAlignmentWhenWeak: true,
  addMissingRequiredElements: missingElements.length > 0,
  fixComplianceIssues: complianceRules.length > 0,
  enhanceReviewerAppeal: reviewerExpectations.length > 0,
  reduceRiskFlags: riskFlags.length > 0,
  readinessLevel: readiness.level || "unknown",
};
const prompt = `
You are a senior grant writer and clarity editor. Improve the clarity, readability, and alignment of the following text. 
Use full grant intelligence: grant requirements, eligibility criteria, alignment matrix, reviewer expectations, compliance rules, risk flags, and readiness scoring.

TEXT TO IMPROVE:
"${text}"

GRANT REQUIREMENTS:
${JSON.stringify(grant, null, 2)}

USER PROFILE:
${JSON.stringify(profile, null, 2)}

ALIGNMENT MATRIX:
${JSON.stringify(alignmentMatrix, null, 2)}

REVIEWER EXPECTATIONS:
${JSON.stringify(reviewerExpectations, null, 2)}

COMPLIANCE RULES:
${JSON.stringify(complianceRules, null, 2)}

RISK FLAGS:
${JSON.stringify(riskFlags, null, 2)}

READINESS:
${JSON.stringify(readiness, null, 2)}

INSTRUCTIONS:
${JSON.stringify(instructions, null, 2)}

OUTPUT REQUIREMENTS:
1. If changes are small (clarity only), return improvedText only.
2. If changes are major (meaning changed, compliance fixed, missing elements added), return:
   - improvedText
   - changesMade (list)
   - reasons (list)
3. Always preserve meaning unless alignment or compliance requires enhancement.
4. If missing required elements were added, explain why.
`;
const improvedText = text + " [IMPROVED]";
const majorChanges = missingElements.length > 0 || complianceRules.length > 0;
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

for (const rule of complianceRules) {
  changesMade.push(`Fixed compliance issue: ${rule.description}`);
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
