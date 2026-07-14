import { NextResponse } from "next/server";
import { runAI } from "@/lib/ai/engine";
import { safeJson } from "@/lib/ai/safeJson";
import { safeResponse } from "@/lib/ai/safeResponse";

export async function POST(req, { params }) {
  const { documentId, workspaceId } = params;
  const { userId, content } = await req.json();

  const prompt = `
    Analyze SUSTAINABILITY of this grant.
    Return JSON under key "sustainability".

    Content:
    ${JSON.stringify(content)}
  `;

  const raw = await runAI(prompt);
  const parsed = safeJson(raw);
  const safe = safeResponse(parsed, "sustainability");

  return NextResponse.json(safe);
}
