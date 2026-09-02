import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  const { _id: workspaceId } = params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { diagnostics = {} } = await req.json().catch(() => ({}));

  const prompt = `
Workspace AI Health Check

Workspace: ${workspaceId}

Diagnostics:
${JSON.stringify(diagnostics, null, 2)}

Return JSON with:
- healthStatus
- failingComponents
- warnings
- recommendedFixes
`;

  const result = await callUnifiedModel(prompt);
  return NextResponse.json({ success: true, health: result });
}
