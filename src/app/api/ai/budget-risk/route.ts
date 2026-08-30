import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { text = "" } = await req.json().catch(() => ({}));

  if (!text) {
    return NextResponse.json(
      { error: "Missing 'text' field" },
      { status: 400 }
    );
  }

  const prompt = `
Analyze the following text for budget-related risks. Return:

- Budget risk score (0–100)
- Overbudget indicators
- Underbudget indicators
- Missing cost justification
- Unrealistic assumptions
- Recommendations to reduce budget risk

Text:
${text}
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({
    success: true,
    budgetRisk: result,
  });
}
