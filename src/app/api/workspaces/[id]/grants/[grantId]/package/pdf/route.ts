import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertGrantWorkspaceAccess } from "@/lib/ai/negotiation";
import { generatePackagePdf } from "@/lib/documents/generatePdf";
import { buildFederalFormsInput } from "@/lib/documents/federalFormsInput";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string; grantId: string };

function slugifyFilename(title: string): string {
  const slug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${slug || "submission-package"}.pdf`;
}

export async function GET(_req: NextRequest, context: { params: Promise<Params> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = await context.params;
  const hasAccess = await assertGrantWorkspaceAccess(params.id, params.grantId, userId);
  if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const grant = await prisma.grant.findUnique({
    where: { id: params.grantId },
    select: {
      title: true,
      agency: true,
      category: true,
      summary: true,
      awardFloor: true,
      awardCeiling: true,
      opportunityNumber: true,
      cfdaNumber: true,
      raw: true,
      source: true,
      workspaceId: true,
    },
  });
  if (!grant) return NextResponse.json({ error: "Grant not found" }, { status: 404 });

  const application = await prisma.application.findFirst({ where: { workspaceId: params.id, grantId: params.grantId } });
  if (!application) {
    return NextResponse.json({ error: "No package generated yet." }, { status: 404 });
  }

  // The SF-424 family (see src/lib/documents/sf424.ts) is a federal OMB
  // form set - only appended for federally-sourced grants. State/foundation
  // packages keep the narrative+budget PDF exactly as before.
  const federalForms = await buildFederalFormsInput(params.id, grant, application);

  let sections: { title: string; content: string }[] = [];
  try {
    sections = application.content ? JSON.parse(application.content)?.sections || [] : [];
  } catch {
    sections = [];
  }

  try {
    const pdfBytes = await generatePackagePdf(grant.title, sections, application.budget as any, federalForms);
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${slugifyFilename(grant.title)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("PACKAGE PDF GENERATION ERROR:", err);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
