import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { grant = {}, reports = [] } = await req.json().catch(() => ({}));

  const prompt = `
Perform closeout compliance analysis.

Grant:
${JSON.stringify(grant, null, 2)}

Reports:
${JSON.stringify(reports, null, 2)}

Return JSON with:
- complianceStatus
- missingReports
- violations
- recommendedFixes
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({ success: true, compliance: result });
}
