import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { grant = {}, narrative = "", org = {} } = await req.json().catch(() => ({}));

  const prompt = `
Score this grant using extended scoring categories.

Grant:
${JSON.stringify(grant, null, 2)}

Organization:
${JSON.stringify(org, null, 2)}

Narrative:
${narrative}

Return JSON with:
- eligibilityScore
- alignmentScore
- competitivenessScore
- readinessScore
- sustainabilityScore
- riskScore
- innovationScore
- strengths
- weaknesses
- recommendations
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({ success: true, extendedScore: result });
}
