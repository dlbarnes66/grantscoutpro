export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { runAI } from "@/lib/ai/engine";
import { safeJson } from "@/lib/ai/safeJson";
import { safeResponse } from "@/lib/ai/safeResponse";
import { canRunDocumentAI } from "@/lib/security/acl";

export async function POST(req, { params }) {
  const { workspaceId, documentId } = params;

  const auth = getAuth(req);
  const userId = auth.userId;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ⭐ Document-level AI permission
  const allowed = await canRunDocumentAI(userId, documentId);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { content } = await req.json();

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
