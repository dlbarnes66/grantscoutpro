import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { groqChat } from "@/lib/ai/groq";
import { getWorkspaceDocumentWithAcl } from "@/lib/documents/acl";

export const dynamic = "force-dynamic";

type Params = { id: string; documentId: string };

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const text = (body.text as string | undefined) ?? "";

  if (!text) return NextResponse.json({ error: "Missing text to rewrite" }, { status: 400 });

  const doc = await getWorkspaceDocumentWithAcl(params.id, params.documentId, userId);
  if (!doc) return NextResponse.json({ error: "Forbidden or document not found" }, { status: 404 });

  const tone = (body.tone as string | undefined) ?? "clear, compelling, and funder‑aligned";

  try {
    const rewritten = await groqChat({
      system: `You are a senior grant writer. Rewrite the text in a ${tone} style. Preserve factual accuracy.`,
      user: text,
    });

    await prisma.aiEventLog.create({
      data: {
        userId,
        workspaceId: params.id,
        documentId: params.documentId,
        type: "document-rewrite",
        payload: { original: text, rewritten, tone },
      },
    });

    return NextResponse.json({ success: true, rewritten });
  } catch (err: any) {
    console.error("DOCUMENT REWRITE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
