import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { grant = {}, org = {}, variables = {} } = await req.json().catch(() => ({}));

  const prompt = `
Simulate grant performance forecast.

Grant:
${JSON.stringify(grant, null, 2)}

Organization:
${JSON.stringify(org, null, 2)}

Variables:
${JSON.stringify(variables, null, 2)}

Return JSON with:
- forecast1yr
- forecast3yr
- forecast5yr
- riskFactors
- recommendedActions
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({ success: true, simulation: result });
}
