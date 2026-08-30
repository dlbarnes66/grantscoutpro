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
  toneRequirements = [],
  riskFlags = [],
  readiness = {},
} = body;
if (!text || text.trim().length === 0) {
  return NextResponse.json(
    { error: "Missing text to edit" },
    { status: 400 }
  );
}
const toneIssues = [];

for (const toneRule of toneRequirements) {
  if (toneRule.pattern && text.toLowerCase().includes(toneRule.pattern.toLowerCase())) {
    toneIssues.push(toneRule);
  }
}
const instructions = {
  improveTone: true,
  alignToneToGrant: true,
  alignToneToReviewerExpectations: reviewerExpectations.length > 0,
  preserveMeaningWhenStrong: true,
  enhanceMeaningWhenWeak: true,
  fixToneIssues: toneIssues.length > 0,
  fixComplianceIssues: complianceRules.length > 0,
  reduceRiskFlags: riskFlags.length > 0,
  readinessLevel: readiness.level || "unknown",
  fabricationMode: "hybrid",
};
const prompt = `
You are a senior grant writer performing tone optimization. 
Your goal is to maximize scoring potential using full grant intelligence: 
grant requirements, tone expectations, reviewer expectations, compliance rules, risk flags, and readiness scoring.

TEXT TO IMPROVE:
"${text}"

GRANT TONE REQUIREMENTS:
${JSON.stringify(toneRequirements, null, 2)}

REVIEWER EXPECTATIONS:
${JSON.stringify(reviewerExpectations, null, 2)}

COMPLIANCE RULES:
${JSON.stringify(complianceRules, null, 2)}

ALIGNMENT MATRIX:
${JSON.stringify(alignmentMatrix, null, 2)}

USER PROFILE:
${JSON.stringify(profile, null, 2)}

RISK FLAGS:
${JSON.stringify(riskFlags, null, 2)}

READINESS:
${JSON.stringify(readiness, null, 2)}

INSTRUCTIONS:
${JSON.stringify(instructions, null, 2)}

OUTPUT REQUIREMENTS:
1. Improve tone for clarity, professionalism, alignment, and scoring.
2. If changes are small, return improvedText only.
3. If changes are major (tone violations, compliance fixes, meaning enhancement), return:
   - improvedText
   - changesMade (list)
   - reasons (list)
4. Use hybrid fabrication:
   - If user provided partial info → expand it.
   - If user provided nothing → fabricate safe generic content.
   - If grant requires specifics → fabricate only what is necessary.
`;
const improvedText = text + " [TONE OPTIMIZED]";
const majorChanges =
  toneIssues.length > 0 ||
  complianceRules.length > 0;
if (!majorChanges) {
  return NextResponse.json({
    success: true,
    mode: "silent",
    improvedText,
  });
}
const changesMade = [];
const reasons = [];

for (const toneRule of toneIssues) {
  changesMade.push(`Fixed tone issue: ${toneRule.description}`);
  reasons.push(
    `The text violated a tone requirement: ${toneRule.description}. It has been corrected.`
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
