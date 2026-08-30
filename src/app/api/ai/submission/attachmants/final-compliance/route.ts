import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { attachments = [] } = await req.json().catch(() => ({}));

  const prompt = `
Check final compliance for submission attachments.

Attachments:
${JSON.stringify(attachments, null, 2)}

Return JSON with:
- complianceIssues
- missingAttachments
- formattingWarnings
- recommendedFixes
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({ success: true, finalCompliance: result });
}
