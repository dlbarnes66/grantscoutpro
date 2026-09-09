import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  assertGrantWorkspaceAccess,
  buildNegotiationContext,
  generateNegotiationSection,
  saveNegotiationSection,
} from "@/lib/ai/negotiation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SYSTEM_PROMPT =
  "You are a senior grants negotiation advisor for a nonprofit. Always respond with a single JSON object, no prose outside the JSON.";

// POST /api/ai/negotiation/scope  { workspaceId, grantId, orgNotes? }
export async function POST(req: NextRequest) {
  try {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const workspaceId = body?.workspaceId as string | undefined;
  const grantId = body?.grantId as string | undefined;
  const orgNotes = typeof body?.orgNotes === "string" ? body.orgNotes.trim() : "";

  if (!workspaceId || !grantId) {
    return NextResponse.json({ error: "workspaceId and grantId are required" }, { status: 400 });
  }

  const allowed = await assertGrantWorkspaceAccess(workspaceId, grantId, userId);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const context = await buildNegotiationContext(grantId);
  if (!context) return NextResponse.json({ error: "Grant not found" }, { status: 404 });

  const userPrompt = `
Analyze the negotiation scope for this grant on behalf of the applicant organization.

Grant:
${JSON.stringify(context.grant, null, 2)}

Organization (${context.workspaceName ?? "unnamed workspace"}):
${JSON.stringify(context.orgProfile ?? {}, null, 2)}
${orgNotes ? `\nAdditional context from the user:\n${orgNotes}` : ""}

Respond with a JSON object with these keys:
- negotiableElements (array of strings)
- nonNegotiableElements (array of strings)
- leveragePoints (array of strings)
- risks (array of strings)
- recommendedStrategy (string)
`.trim();

  const { parsed, raw } = await generateNegotiationSection(SYSTEM_PROMPT, userPrompt);
  await saveNegotiationSection(userId, grantId, "scope", raw);

  return NextResponse.json({ success: true, scope: parsed ?? raw });
  } catch (err) {
    console.error("Negotiation scope route crashed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Something went wrong generating this section. Please try again." },
      { status: 500 }
    );
  }
}
