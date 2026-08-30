import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { narrative = "" } = await req.json().catch(() => ({}));

  const prompt = `
Predict scalability potential.

Narrative:
${narrative}

Return JSON with:
- scalabilityScore
- scalingBarriers
- resourceRequirements
- recommendations
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({ success: true, scalability: result });
}
