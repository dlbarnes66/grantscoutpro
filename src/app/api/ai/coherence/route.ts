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

  if (!text || typeof text !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid 'text' field" },
      { status: 400 }
    );
  }

  const prompt = `
Analyze the coherence of the following text. Return:

- Logical flow score (0–100)
- Transition quality
- Argument consistency
- Structural coherence
- Recommendations to improve coherence

Text:
${text}
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({
    success: true,
    coherence: result,
  });
}
