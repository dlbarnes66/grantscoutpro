import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type MatchInput = {
  funderFocusAreas?: string[];
  projectFocusAreas?: string[];
  locationMatch?: boolean;
};

export async function POST(req: NextRequest) {
  const body: MatchInput = await req.json().catch(() => ({}));

  const funderAreas = body.funderFocusAreas ?? [];
  const projectAreas = body.projectFocusAreas ?? [];

  const overlap = projectAreas.filter((p) => funderAreas.includes(p));
  const baseScore = overlap.length * 20;

  const locationBoost = body.locationMatch ? 15 : 0;

  const score = Math.min(100, baseScore + locationBoost);

  return NextResponse.json({
    score,
    overlap,
    explanation: `Match score is ${score} based on thematic overlap and location alignment.`
  });
}
