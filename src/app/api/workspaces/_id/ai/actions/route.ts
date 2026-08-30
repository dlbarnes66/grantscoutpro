import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  const { _id: workspaceId } = params;
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action = "", payload = {} } = await req.json().catch(() => ({}));

  const prompt = `
Workspace AI Action Execution

Workspace: ${workspaceId}

Action:
${action}

Payload:
${JSON.stringify(payload, null, 2)}

Return JSON with:
- actionResult
- reasoning
- recommendedNextSteps
`;

  const result = await callUnifiedModel(prompt);
  return NextResponse.json({ success: true, actions: result });
}
