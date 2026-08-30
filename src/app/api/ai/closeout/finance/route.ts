import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { budget = {}, expenses = [] } = await req.json().catch(() => ({}));

  const prompt = `
Perform closeout financial reconciliation.

Budget:
${JSON.stringify(budget, null, 2)}

Expenses:
${JSON.stringify(expenses, null, 2)}

Return JSON with:
- reconciliationSummary
- overages
- underspending
- complianceRisks
- recommendedActions
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({ success: true, finance: result });
}
