import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { grant = {}, org = {}, narrative = "" } = await req.json().catch(() => ({}));

  const prompt = `
Estimate the probability of success for this grant application.

Grant:
${JSON.stringify(grant, null, 2)}

Organization:
${JSON.stringify(org, null, 2)}

Narrative:
${narrative}

Return JSON with:
- probability (0–100)
- keyFactors
- risks
- strengths
- recommendations
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({
    success: true,
    probability: result,
  });
}
