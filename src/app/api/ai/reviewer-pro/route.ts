import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { narrative = "", criteria = "", org = {} } = await req.json().catch(() => ({}));

  const prompt = `
Act as an advanced reviewer (Reviewer-Pro).

Narrative:
${narrative}

Criteria:
${criteria}

Organization:
${JSON.stringify(org, null, 2)}

Return JSON with:
- detailedScoreBreakdown
- weightedScores
- strategicRisks
- highImpactRecommendations
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({ success: true, reviewerPro: result });
}
