import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertGrantWorkspaceAccess } from "@/lib/ai/negotiation";
import { generatePackagePdf, type FederalFormsInput } from "@/lib/documents/generatePdf";
import { resolveOrganizationType } from "@/lib/grants/orgType";

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
  // form set - only append it for federally-sourced grants, same as the
  // rest of the app's federal-only feature gating. State/foundation
  // packages keep the narrative+budget PDF exactly as before.
  let federalForms: FederalFormsInput | null = null;
  if (grant.source === "FEDERAL") {
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.id },
      select: { ownerId: true, organizationTypeOverride: true },
    });
    const profile = workspace
      ? await prisma.userProfile.findUnique({ where: { userId: workspace.ownerId } })
      : null;
    const budgetTotal = (application.budget as any)?.total;
    const requestedAmount =
      typeof budgetTotal === "number" ? budgetTotal : grant.awardCeiling ?? grant.awardFloor ?? 0;

    federalForms = {
      profile: {
        organizationName: profile?.organizationName ?? null,
        organizationType:
          resolveOrganizationType(
            { organizationTypeOverride: workspace?.organizationTypeOverride ?? null },
            profile
          ) ?? null,
        ein: profile?.ein ?? null,
        uei: profile?.uei ?? null,
        streetAddress: profile?.streetAddress ?? null,
        addressLine2: profile?.addressLine2 ?? null,
        city: profile?.city ?? null,
        state: profile?.state ?? null,
        zipCode: profile?.zipCode ?? null,
        county: profile?.county ?? null,
        country: profile?.country ?? null,
        orgPhone: profile?.orgPhone ?? null,
        congressionalDistrictApplicant: profile?.congressionalDistrictApplicant ?? null,
        congressionalDistrictProject: profile?.congressionalDistrictProject ?? null,
        authorizedRepName: profile?.authorizedRepName ?? null,
        authorizedRepTitle: profile?.authorizedRepTitle ?? null,
        authorizedRepPhone: profile?.authorizedRepPhone ?? null,
        authorizedRepEmail: profile?.authorizedRepEmail ?? null,
        geographicService: profile?.geographicService ?? null,
      },
      grant: {
        title: grant.title,
        agency: grant.agency,
        category: grant.category,
        summary: grant.summary,
        awardFloor: grant.awardFloor,
        awardCeiling: grant.awardCeiling,
        opportunityNumber: grant.opportunityNumber,
        cfdaNumber: grant.cfdaNumber,
        raw: grant.raw,
      },
      requestedAmount,
    };
  }

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
