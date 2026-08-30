import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { org = {}, matches = [] } = await req.json().catch(() => ({}));

  const prompt = `
Summarize matching history.

Organization:
${JSON.stringify(org, null, 2)}

Matches:
${JSON.stringify(matches, null, 2)}

Return JSON with:
- summary
- trends
- keyInsights
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({ success: true, history: result });
}
