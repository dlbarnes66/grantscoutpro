import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { weightedScores, disagreement } = await req.json();

    if (!weightedScores || !disagreement) {
      return NextResponse.json({ error: "Missing weightedScores or disagreement" }, { status: 400 });
    }

    const avgScore =
      weightedScores.reduce((sum: number, r: any) => sum + r.weightedScore, 0) /
      weightedScores.length;

    const consensus =
      disagreement.disagreementLevel === "high"
        ? avgScore * 0.85
        : disagreement.disagreementLevel === "medium"
        ? avgScore * 0.93
        : avgScore;

    return NextResponse.json({
      consensusScore: consensus,
      decision:
        consensus >= 85 ? "strongly recommended" :
        consensus >= 70 ? "recommended" :
        consensus >= 55 ? "borderline" :
        "not recommended"
    });
  } catch (err: any) {
    console.error("Consensus engine error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
