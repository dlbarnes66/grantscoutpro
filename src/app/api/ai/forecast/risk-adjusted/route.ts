export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";




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

    const fundingRisk = await call("/api/ai/risk/funding", { grant: grants[0], profile });
    const operationalRisk = await call("/api/ai/risk/operational", { grant: grants[0], profile });

    const riskFactor =
      (fundingRisk.probabilityOfFailure ?? 0.3) * 0.6 +
      (operationalRisk.overallRiskLevel === "high" ? 0.3 :
       operationalRisk.overallRiskLevel === "medium" ? 0.15 : 0.05);

    return NextResponse.json({
      riskFactor,
      adjustedMultiplier: 1 - riskFactor,
      summary: "Risk-adjusted multiplier applied to projections."
    });
  } catch (err: any) {
    console.error("Risk-adjusted forecast error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
