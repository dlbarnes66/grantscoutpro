import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { target = "", history = "" } = await req.json().catch(() => ({}));

  const prompt = `
Analyze relationship history and generate outreach strategy.

Target:
${target}

History:
${history}

Return JSON with:
- relationshipStatus
- opportunities
- risks
- recommendedActions
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({ success: true, relationship: result });
}
