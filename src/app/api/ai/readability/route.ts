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
Evaluate the readability of the following text. Return:

- Grade level
- Clarity score (0–100)
- Complexity score (0–100)
- Sentence structure notes
- Recommendations to improve readability

Text:
${text}
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({
    success: true,
    readability: result,
  });
}
