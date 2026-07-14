import { NextResponse } from "next/server";
import { runAI } from "@/lib/ai/engine";
import { safeJson } from "@/lib/ai/safeJson";
import { safeResponse } from "@/lib/ai/safeResponse";

export async function POST(req, { params }) {
  const { documentId, workspaceId } = params;
  const { userId, content } = await req.json();

  const prompt = `
    Analyze INNOVATION STRENGTH.
    Return JSON under key "innovation".

    Content:
    ${JSON.stringify(content)}
  `;

  const raw = await runAI(prompt);
  const parsed = safeJson(raw);
  const safe = safeResponse(parsed, "innovation");

  return NextResponse.json(safe);
}
