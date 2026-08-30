import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RiskInput = {
 orgAgeYears?: number;
auditFindings?: boolean;
staffTurnoverRate?: number;
singleFunderDependency?: boolean;
};

export async function POST(req: NextRequest) {
  const body: RiskInput = await req.json().catch(() => ({}));

  const flags: string[] = [];

  if ((body.orgAgeYears ?? 0) < 2)
    flags.push("New organization (<2 years) increases perceived risk.");
  if (body.auditFindings)
    flags.push("Recent audit findings may concern compliance.");
  if ((body.staffTurnoverRate ?? 0) > 0.3)
    flags.push("High staff turnover may impact project stability.");
  if (body.singleFunderDependency)
    flags.push("Heavy reliance on a single funder increases financial risk.");

  const riskLevel =
    flags.length === 0 ? "low" : flags.length === 1 ? "moderate" : "high";

  return NextResponse.json({
    riskLevel,
    flags
  });
}
