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
Summarize the following grant opportunity. Return:

- shortSummary (2–3 sentences)
- keyFundingDetails
- eligibilityOverview
- deadlines
- strategicFitNotes
- risks or limitations

Text:
${text}
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({
    success: true,
    summary: result,
  });
}
