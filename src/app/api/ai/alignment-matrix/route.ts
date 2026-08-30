import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { narrative = "", criteria = "" } = await req.json().catch(() => ({}));

  if (!narrative || !criteria) {
    return NextResponse.json(
      { error: "Missing 'narrative' or 'criteria'" },
      { status: 400 }
    );
  }

  const prompt = `
You are an alignment matrix engine. Compare the grant narrative against the criteria.

Return a JSON object with:

- alignmentScore (0–100)
- strengths
- weaknesses
- missing elements
- alignmentMatrix (list of criteria with pass/fail/partial)
- recommendations

Narrative:
${narrative}

Criteria:
${criteria}
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({
    success: true,
    alignment: result,
  });
}
