import { NextResponse } from "next/server";
import { runAI } from "@/lib/ai/engine";
import { safeJson } from "@/lib/ai/safeJson";

export async function POST(req, { params }) {
  const { workspaceId, documentId } = params;
  const { userId, content, tools } = await req.json();

  const prompt = `
    Analyze this grant using the following tools:
    ${tools.join(", ")}

    Return JSON with each tool as a key.

    Content:
    ${JSON.stringify(content)}
  `;

  const raw = await runAI(prompt);
  const parsed = safeJson(raw);

  return NextResponse.json(parsed);
}
