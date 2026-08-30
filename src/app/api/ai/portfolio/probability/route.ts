import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { grants = [], org = {} } = await req.json().catch(() => ({}));

  const prompt = `
Estimate success probabilities for this portfolio.

Organization:
${JSON.stringify(org, null, 2)}

Grants:
${JSON.stringify(grants, null, 2)}

Return JSON with:
- probabilitiesByGrant
- weightedPortfolioProbability
- keyFactors
- riskDrivers
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({ success: true, probability: result });
}
