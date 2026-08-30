import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { org = {}, grants = [] } = await req.json().catch(() => ({}));

  const prompt = `
Perform general grant matching.

Organization:
${JSON.stringify(org, null, 2)}

Grants:
${JSON.stringify(grants, null, 2)}

Return JSON with:
- matches
- scores
- reasoning
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({ success: true, match: result });
}
