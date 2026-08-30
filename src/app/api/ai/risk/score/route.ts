import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { grant = {}, org = {} } = await req.json().catch(() => ({}));

  const prompt = `
Score risks for this grant.

Grant:
${JSON.stringify(grant, null, 2)}

Organization:
${JSON.stringify(org, null, 2)}

Return JSON with:
- riskScore (0–100)
- riskCategories
- riskDrivers
- mitigationPlan
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({ success: true, risk: result });
}
