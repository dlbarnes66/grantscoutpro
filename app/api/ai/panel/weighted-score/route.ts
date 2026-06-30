import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { reviewers } = await req.json();

    if (!reviewers) {
      return NextResponse.json({ error: "Missing reviewers" }, { status: 400 });
    }

    const weighted = reviewers.map((r: any) => {
      const expertiseWeight =
        r.background.includes("finance") ? 1.2 :
        r.background.includes("program evaluation") ? 1.15 :
        r.background.includes("community impact") ? 1.1 :
        1.0;

      return {
        name: r.name,
        rawScore: r.score,
        weightedScore: r.score * expertiseWeight,
        weight: expertiseWeight
      };
    });

    return NextResponse.json({ weighted });
  } catch (err: any) {
    console.error("Weighted scoring error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
