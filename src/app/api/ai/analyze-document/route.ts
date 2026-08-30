import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text = "", mode = "full" } = await req.json().catch(() => ({}));

  const prompt = `
Analyze this document.

Mode: ${mode}

Text:
${text}

Return JSON with:
- summary
- keyPoints
- risks
- opportunities
- complianceNotes
- readabilityScore
- recommendations
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({ success: true, analysis: result });
}
