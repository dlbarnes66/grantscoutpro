import { NextResponse } from "next/server";
import { runAI } from "@/lib/ai/engine";
import { safeJson } from "@/lib/ai/safeJson";
import { safeResponse } from "@/lib/ai/safeResponse";

export async function POST(req, { params }) {
  const { documentId, workspaceId } = params;
  const { userId, content } = await req.json();

  const prompt = `
    Analyze this grant for COMPLIANCE.
    Return JSON with:
    {
      "compliance": {
        "overallScore": number,
        "sections": [],
        "globalRecommendations": []
      },
      "output": {}
    }

    Content:
    ${JSON.stringify(content)}
  `;

  const raw = await runAI(prompt);
  const parsed = safeJson(raw);
  const safe = safeResponse(parsed, "compliance");

  return NextResponse.json(safe);
}
