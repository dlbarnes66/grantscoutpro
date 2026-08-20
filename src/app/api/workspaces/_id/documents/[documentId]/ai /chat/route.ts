import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  const { workspaceId, documentId } = params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message = "", context = "" } = await req.json().catch(() => ({}));

  const prompt = `
Workspace Document Chat

Workspace: ${workspaceId}
Document: ${documentId}

Message:
${message}

Context:
${context}

Return JSON with:
- reply
- reasoning
- suggestedNextActions
`;

  const result = await callUnifiedModel(prompt);
  return NextResponse.json({ success: true, chat: result });
}
