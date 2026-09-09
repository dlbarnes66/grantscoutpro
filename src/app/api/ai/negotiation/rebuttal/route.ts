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

// POST /api/ai/negotiation/rebuttal  { workspaceId, grantId, objection, orgNotes? }
export async function POST(req: NextRequest) {
  try {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const workspaceId = body?.workspaceId as string | undefined;
  const grantId = body?.grantId as string | undefined;
  const objection = typeof body?.objection === "string" ? body.objection.trim() : "";
  const orgNotes = typeof body?.orgNotes === "string" ? body.orgNotes.trim() : "";

  if (!workspaceId || !grantId) {
    return NextResponse.json({ error: "workspaceId and grantId are required" }, { status: 400 });
  }
  if (!objection) {
    return NextResponse.json({ error: "objection is required" }, { status: 400 });
  }

  const allowed = await assertGrantWorkspaceAccess(workspaceId, grantId, userId);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const context = await buildNegotiationContext(grantId);
  if (!context) return NextResponse.json({ error: "Grant not found" }, { status: 404 });

  const userPrompt = `
Generate a rebuttal for this grant negotiation objection.

Objection raised by the funder/officer:
${objection}

Grant:
${JSON.stringify(context.grant, null, 2)}

Organization (${context.workspaceName ?? "unnamed workspace"}):
${JSON.stringify(context.orgProfile ?? {}, null, 2)}
${orgNotes ? `\nAdditional context from the user:\n${orgNotes}` : ""}

Respond with a JSON object with these keys:
- rebuttal (string)
- supportingEvidence (array of strings)
- alternativeOptions (array of strings)
`.trim();

  const { parsed, raw } = await generateNegotiationSection(SYSTEM_PROMPT, userPrompt);
  await saveNegotiationSection(userId, grantId, "rebuttal", raw);

  return NextResponse.json({ success: true, rebuttal: parsed ?? raw });
  } catch (err) {
    console.error("Negotiation rebuttal route crashed:", err);
    const message = err instanceof Error ? err.message : "Something went wrong generating this section. Please try again.";
    // Temporary extra detail (name + first few stack frames) so a failure
    // that reaches here is diagnosable from the UI alone, without needing
    // to pull Vercel function logs.
    const where =
      err instanceof Error && err.stack
        ? " [" + err.name + ": " + err.stack.split("\n").slice(1, 4).map((l) => l.trim()).join(" | ") + "]"
        : "";
    return NextResponse.json({ error: message + where }, { status: 500 });
  }
}
