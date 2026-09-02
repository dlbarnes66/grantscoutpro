import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  const { _id: workspaceId } = params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tasks = [] } = await req.json().catch(() => ({}));

  const prompt = `
Workspace AI Orchestration

Workspace: ${workspaceId}

Tasks:
${JSON.stringify(tasks, null, 2)}

Return JSON with:
- orchestrationPlan
- taskOrder
- dependencies
- executionNotes
`;

  const result = await callUnifiedModel(prompt);
  return NextResponse.json({ success: true, orchestrate: result });
}
