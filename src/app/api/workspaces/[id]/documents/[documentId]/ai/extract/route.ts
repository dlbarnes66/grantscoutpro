import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { groqChat } from "@/lib/ai/groq";
import { getWorkspaceDocumentWithAcl } from "@/lib/documents/acl";
import { checkRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

type Params = { id: string; documentId: string };

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const overrideText = body.text as string | undefined;

  const doc = await getWorkspaceDocumentWithAcl(params.id, params.documentId, userId);
  if (!doc) return NextResponse.json({ error: "Forbidden or document not found" }, { status: 404 });

  const __rl = await checkRateLimit(`ai-panel:${params.id}`, 60, 60 * 60);
  if (!__rl.allowed) {
    return NextResponse.json(
      { error: "This workspace has hit its AI usage limit (60 calls/hour). Please try again shortly." },
      { status: 429 }
    );
  }

  const text = overrideText ?? doc.content ?? "";
  if (!text) return NextResponse.json({ error: "Document is empty" }, { status: 400 });

  const instructions =
    (body.instructions as string | undefined) ??
    "Extract: (1) organization mission, (2) target population, (3) geographic focus, (4) funding need, (5) outcomes.";

  try {
    const jsonString = await groqChat({
      system:
        "You are an information extraction assistant. Return a strict JSON object only, no prose, matching the requested fields.",
      user: `${instructions}\n\nTEXT:\n${text}`,
    });

    let extracted: any;
    try {
      extracted = JSON.parse(jsonString);
    } catch {
      extracted = { raw: jsonString };
    }

    await prisma.aiEventLog.create({
      data: {
        userId,
        workspaceId: params.id,
        documentId: params.documentId,
        type: "document-extract",
        payload: { instructions, extracted },
      },
    });

    return NextResponse.json({ success: true, extracted });
  } catch (err: any) {
    console.error("DOCUMENT EXTRACT ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
