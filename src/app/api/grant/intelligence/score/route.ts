import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type ScoreInput = {
  eligibilityScore?: number;
  matchScore?: number;
  riskLevel?: "low" | "moderate" | "high";
};

export async function POST(req: NextRequest) {
  const body: ScoreInput = await req.json().catch(() => ({}));

  const eligibility = body.eligibilityScore ?? 0;
  const match = body.matchScore ?? 0;

  let riskPenalty = 0;
  if (body.riskLevel === "moderate") riskPenalty = 10;
  if (body.riskLevel === "high") riskPenalty = 25;

  const composite = Math.max(0, Math.min(100, Math.round((eligibility * 0.4) + (match * 0.6) - riskPenalty)));

  return NextResponse.json({
    compositeScore: composite,
    explanation: `Composite score combines eligibility (${eligibility}), match (${match}), and risk penalty (${riskPenalty}).`
  });
}
