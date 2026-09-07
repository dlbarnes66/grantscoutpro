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

  try {
    const summary = await groqChat({
      system: "You are an expert grant writing assistant. Summarize the text clearly and concisely for nonprofit leaders.",
      user: text,
    });

    await prisma.aiEventLog.create({
      data: {
        userId,
        workspaceId: params.id,
        documentId: params.documentId,
        type: "document-summarize",
        payload: { summary },
      },
    });

    return NextResponse.json({ success: true, summary });
  } catch (err: any) {
    console.error("DOCUMENT SUMMARIZE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
