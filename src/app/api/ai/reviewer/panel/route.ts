import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { narrative = "", reviewers = [] } = await req.json().catch(() => ({}));

  const prompt = `
Simulate a grant review panel.

Narrative:
${narrative}

Reviewers:
${JSON.stringify(reviewers, null, 2)}

Return JSON with:
- panelScores
- consensusScore
- disagreements
- keyReviewerNotes
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({ success: true, panel: result });
}
