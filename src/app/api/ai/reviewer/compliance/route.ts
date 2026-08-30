import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { narrative = "", requirements = "" } = await req.json().catch(() => ({}));

  const prompt = `
Check compliance from a reviewer perspective.

Narrative:
${narrative}

Requirements:
${requirements}

Return JSON with:
- complianceScore
- violations
- missingElements
- recommendedFixes
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({ success: true, compliance: result });
}
