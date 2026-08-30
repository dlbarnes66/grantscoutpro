import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { grant = {}, org = {}, probabilities = {} } = await req.json().catch(() => ({}));

  const prompt = `
Generate probability-weighted forecast.

Grant:
${JSON.stringify(grant, null, 2)}

Organization:
${JSON.stringify(org, null, 2)}

Probabilities:
${JSON.stringify(probabilities, null, 2)}

Return JSON with:
- weightedForecast1yr
- weightedForecast3yr
- weightedForecast5yr
- probabilityBreakdown
- recommendations
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({ success: true, weightedForecast: result });
}
