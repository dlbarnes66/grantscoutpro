import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text = "" } = await req.json().catch(() => ({}));

  const prompt = `
Improve reasoning and logic.

Text:
${text}

Return JSON with:
- improvedText
- reasoningNotes
- logicFixes
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({ success: true, reasoning: result });
}
