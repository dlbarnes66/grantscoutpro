import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { grants = [] } = await req.json().catch(() => ({}));

  if (!Array.isArray(grants) || grants.length < 2) {
    return NextResponse.json(
      { error: "Provide at least 2 grants to compare" },
      { status: 400 }
    );
  }

  const prompt = `
Compare the following grants:

${JSON.stringify(grants, null, 2)}

Return JSON with:
- comparisonMatrix
- strengthsByGrant
- weaknessesByGrant
- bestFitRecommendations
`;

  const result = await callUnifiedModel(prompt);

  return NextResponse.json({
    success: true,
    comparison: result,
  });
}
