import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function call(path: string, body: any) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  return await res.json();
}

export async function POST(req: Request) {
  try {
    const { grants, profile } = await req.json();

    const ranked = await call("/api/ai/matching/probability-weighted", { grants, profile });

    const explanations = [];
    for (const item of ranked.ranked) {
      const grant = grants.find((g: any) => g.id === item.grantId);
      explanations.push({
        grantId: item.grantId,
        score: item.finalScore,
        explanation: await call("/api/ai/matching/explain", { grant, profile })
      });
    }

    return NextResponse.json({
      recommendations: explanations.sort((a: any, b: any) => b.score - a.score)
    });
  } catch (err: any) {
    console.error("Recommendation engine error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
