import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { grant = {} } = await req.json().catch(() => ({}));

  const prompt = `
Evaluate grant health.

Grant:
${JSON.stringify(grant, null, 2)}

Return JSON with:
- healthScore (0–100)
- strengths
- weaknesses
- risks
- recommendedActions
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({ success: true, health: result });
}
