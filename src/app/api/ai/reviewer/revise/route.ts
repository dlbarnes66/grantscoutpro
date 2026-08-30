import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text = "", feedback = "" } = await req.json().catch(() => ({}));

  const prompt = `
Revise the text based on reviewer feedback.

Feedback:
${feedback}

Text:
${text}

Return JSON with:
- revisedText
- revisionNotes
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({ success: true, revised: result });
}
