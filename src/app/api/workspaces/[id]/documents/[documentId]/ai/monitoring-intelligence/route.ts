import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";
import { guardAIRequest } from "@/lib/ai/guardAIRequest";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  const { workspaceId, documentId } = params;
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { monitoring = {}, text = "" } = await req.json().catch(() => ({}));

  const prompt = `
Monitoring-Linked Workspace Document Intelligence

Workspace: ${workspaceId}
Document: ${documentId}

Monitoring:
${JSON.stringify(monitoring, null, 2)}

Text:
${text}

Return JSON with:
- monitoringFitScore
- KPIAlignment
- reportingRisks
- missingMonitoringElements
- recommendations
`;

  const __aiGuard = await guardAIRequest(params.id, userId);
  if (__aiGuard) return __aiGuard;

  const result = await callUnifiedModel(prompt);
  return NextResponse.json({ success: true, monitoringIntelligence: result });
}
