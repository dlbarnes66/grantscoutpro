import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { grant = {}, org = {} } = await req.json().catch(() => ({}));

  const prompt = `
Generate KPIs for this grant.

Grant:
${JSON.stringify(grant, null, 2)}

Organization:
${JSON.stringify(org, null, 2)}

Return JSON with:
- recommendedKPIs
- measurementPlan
- riskAreas
- optimizationIdeas
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({ success: true, kpis: result });
}
