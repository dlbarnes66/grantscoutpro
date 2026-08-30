import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { narrative = "", rubric = {} } = await req.json().catch(() => ({}));

  const prompt = `
Evaluate the narrative using the rubric.

Narrative:
${narrative}

Rubric:
${JSON.stringify(rubric, null, 2)}

Return JSON with:
- scoresByCriterion
- totalScore
- strengths
- weaknesses
- recommendations
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({ success: true, evaluation: result });
}
