import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { grant = {}, org = {}, risks = [] } = await req.json().catch(() => ({}));

  const prompt = `
Generate risk-adjusted forecast.

Grant:
${JSON.stringify(grant, null, 2)}

Organization:
${JSON.stringify(org, null, 2)}

Risks:
${JSON.stringify(risks, null, 2)}

Return JSON with:
- adjustedForecast1yr
- adjustedForecast3yr
- adjustedForecast5yr
- riskImpactAnalysis
- mitigationRecommendations
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({ success: true, riskAdjusted: result });
}
