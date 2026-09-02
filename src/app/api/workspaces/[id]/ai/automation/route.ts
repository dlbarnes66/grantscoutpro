import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  const { _id: workspaceId } = params;
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { event = "", payload = {} } = await req.json().catch(() => ({}));

  const prompt = `
Workspace Automation Engine

Workspace: ${workspaceId}

Event:
${event}

Payload:
${JSON.stringify(payload, null, 2)}

Return JSON with:
- automationActions
- reasoning
- recommendedNextSteps
`;

  const result = await callUnifiedModel(prompt);
  return NextResponse.json({ success: true, automation: result });
}
