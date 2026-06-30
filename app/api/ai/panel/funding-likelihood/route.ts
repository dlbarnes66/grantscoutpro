import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { consensusScore } = await req.json();

    if (consensusScore === undefined) {
      return NextResponse.json({ error: "Missing consensusScore" }, { status: 400 });
    }

    const probability =
      consensusScore >= 85 ? 0.92 :
      consensusScore >= 70 ? 0.78 :
      consensusScore >= 55 ? 0.52 :
      0.25;

    return NextResponse.json({
      probability,
      summary:
        probability >= 0.9 ? "Very high likelihood of funding" :
        probability >= 0.75 ? "High likelihood of funding" :
        probability >= 0.5 ? "Moderate likelihood of funding" :
        "Low likelihood of funding"
    });
  } catch (err: any) {
    console.error("Funding likelihood error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
