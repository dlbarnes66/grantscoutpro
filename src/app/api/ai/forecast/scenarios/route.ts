import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { grant = {}, scenarios = [] } = await req.json().catch(() => ({}));

  const prompt = `
Generate scenario-based forecasts.

Grant:
${JSON.stringify(grant, null, 2)}

Scenarios:
${JSON.stringify(scenarios, null, 2)}

Return JSON with:
- scenarioForecasts
- riskComparisons
- recommendedStrategy
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({ success: true, scenarios: result });
}
