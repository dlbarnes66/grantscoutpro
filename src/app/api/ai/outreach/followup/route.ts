import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { context = "" } = await req.json().catch(() => ({}));

  const prompt = `
Write a follow-up outreach message.

Context:
${context}

Return JSON with:
- subject
- body
- recommendedTiming
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({ success: true, followup: result });
}
