import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type EligibilityInput = {
  orgType?: string;
  location?: string;
  annualBudget?: number;
  populationsServed?: string[];
  focusAreas?: string[];
};

export async function POST(req: NextRequest) {
  const body: EligibilityInput = await req.json().catch(() => ({}));

  const issues: string[] = [];

  if (!body.orgType) issues.push("Organization type is missing.");
  if (!body.location) issues.push("Location is missing.");
  if (!body.focusAreas || body.focusAreas.length === 0)
    issues.push("No focus areas specified.");

  const eligible = issues.length === 0;

  return NextResponse.json({
    eligible,
    reasons: eligible ? ["Meets basic eligibility criteria."] : issues
  });
}
