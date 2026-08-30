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

  if (!text) {
    return NextResponse.json(
      { error: "Missing 'text' field" },
      { status: 400 }
    );
  }

  const prompt = `
Scan the following text for compliance issues. Return:

- Compliance score (0–100)
- Violations detected
- Missing required elements
- Risky language
- Recommendations to fix compliance issues

Text:
${text}
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({
    success: true,
    compliance: result,
  });
}
