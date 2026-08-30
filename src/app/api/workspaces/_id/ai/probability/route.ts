import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  const { _id: workspaceId } = params;
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { documents = [], grants = [], org = {} } = await req.json().catch(() => ({}));

  const prompt = `
Workspace-Level Probability Modeling

Workspace: ${workspaceId}

Organization:
${JSON.stringify(org, null, 2)}

Documents:
${JSON.stringify(documents, null, 2)}

Grants:
${JSON.stringify(grants, null, 2)}

Return JSON with:
- probabilityScores
- likelihoodFactors
- confidenceLevels
- recommendedActions
`;

  const result = await callUnifiedModel(prompt);
  return NextResponse.json({ success: true, probability: result });
}
