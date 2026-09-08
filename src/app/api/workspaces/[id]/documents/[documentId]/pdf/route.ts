import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceDocumentWithAcl } from "@/lib/documents/acl";
import { generateDocumentPdf } from "@/lib/documents/generatePdf";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string; documentId: string };

function slugifyFilename(title: string): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${slug || "document"}.pdf`;
}

export async function GET(_req: NextRequest, context: { params: Promise<Params> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = await context.params;

  const doc = await getWorkspaceDocumentWithAcl(params.id, params.documentId, userId);
  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  try {
    const pdfBytes = await generateDocumentPdf(doc.title, doc.content || "");

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${slugifyFilename(doc.title)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("DOCUMENT PDF GENERATION ERROR:", err);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
