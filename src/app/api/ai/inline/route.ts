import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { text = "", instruction = "" } = await req.json().catch(() => ({}));

  if (!text || !instruction) {
    return NextResponse.json(
      { error: "Missing 'text' or 'instruction'" },
      { status: 400 }
    );
  }

  const prompt = `
You are an inline editing engine. Apply the following instruction to the text.

Instruction:
${instruction}

Text:
${text}

Return ONLY the edited text.
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({
    success: true,
    edited: result,
  });
}
