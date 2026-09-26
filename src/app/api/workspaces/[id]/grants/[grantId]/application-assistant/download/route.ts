import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { prisma } from "@/lib/prisma";
import { assertGrantWorkspaceAccess } from "@/lib/ai/negotiation";
import type { ApplicationQuestion } from "@/lib/ai/applicationAssistant";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string; grantId: string };

// Word, not PDF, is the deliberate choice here (unlike .../package's PDF
// export) - the whole point of this feature is copying each answer into
// the funder's own web form field by field, and that's far easier out
// of an editable .docx than a PDF.
export async function GET(_req: NextRequest, context: { params: Promise<Params> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = await context.params;
  const hasAccess = await assertGrantWorkspaceAccess(params.id, params.grantId, userId);
  if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [grant, assistant] = await Promise.all([
    prisma.grant.findUnique({ where: { id: params.grantId }, select: { title: true, workspaceId: true } }),
    prisma.applicationAssistant.findFirst({
      where: { workspaceId: params.id, grantId: params.grantId },
    }),
  ]);

  if (!grant || grant.workspaceId !== params.id) {
    return NextResponse.json({ error: "Grant not found" }, { status: 404 });
  }
  if (!assistant) {
    return NextResponse.json({ error: "No drafted answers yet for this grant" }, { status: 404 });
  }

  const questions = Array.isArray(assistant.questions) ? (assistant.questions as unknown as ApplicationQuestion[]) : [];

  const children: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun(grant.title)],
    }),
    new Paragraph({
      children: [new TextRun({ text: "Drafted with Grant Scout Pro - review and edit before submitting through the funder's own application.", italics: true, color: "666666" })],
    }),
    new Paragraph({ text: "" }),
  ];

  for (const q of questions) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun(q.prompt || "Question")],
      })
    );
    if (q.wordLimit) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `(Limit: ${q.wordLimit} words)`, italics: true, color: "888888", size: 18 })],
        })
      );
    }
    children.push(new Paragraph({ children: [new TextRun(q.answer || "")] }));
    children.push(new Paragraph({ text: "" }));
  }

  const doc = new Document({
    sections: [{ children }],
  });

  const buffer = await Packer.toBuffer(doc);
  const filename = `${grant.title.replace(/[^a-z0-9]+/gi, "_").slice(0, 60)}_application_draft.docx`;

  return new NextResponse(new Blob([new Uint8Array(buffer)]), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
