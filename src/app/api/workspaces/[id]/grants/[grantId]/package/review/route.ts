import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertGrantWorkspaceAccess } from "@/lib/ai/negotiation";
import { resolveChecklist, type PackageChecklist } from "@/lib/ai/packageChecklist";
import { reviewPackage } from "@/lib/ai/packageReview";
import { getProfileContext, packageActionAllowed, parseSections } from "@/lib/ai/packageContext";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

type Params = { id: string; grantId: string };

export async function GET(_req: NextRequest, context: { params: Promise<Params> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const params = await context.params;
  if (!(await assertGrantWorkspaceAccess(params.id, params.grantId, userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const application = await prisma.application.findFirst({
    where: { workspaceId: params.id, grantId: params.grantId },
    select: { review: true, updatedAt: true },
  });
  return NextResponse.json({ review: application?.review ?? null, packageUpdatedAt: application?.updatedAt ?? null });
}

// POST - run the final compliance and consistency review against the
// SAVED draft (unsaved edits in the browser are not seen), and store it.
export async function POST(_req: NextRequest, context: { params: Promise<Params> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const params = await context.params;
  if (!(await assertGrantWorkspaceAccess(params.id, params.grantId, userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!(await packageActionAllowed("review", userId))) {
    return NextResponse.json({ error: "Too many reviews this hour. Please try again later." }, { status: 429 });
  }

  const application = await prisma.application.findFirst({ where: { workspaceId: params.id, grantId: params.grantId } });
  if (!application) return NextResponse.json({ error: "Generate the submission package first." }, { status: 404 });
  const grant = await prisma.grant.findUnique({ where: { id: params.grantId } });
  if (!grant) return NextResponse.json({ error: "Grant not found" }, { status: 404 });

  const sections = parseSections(application.content);
  const budget = application.budget as any;
  const stored = application.checklist as unknown as PackageChecklist | null;
  const checklist = stored ? resolveChecklist(stored, sections, budget) : null;
  const profile = await getProfileContext(params.id);

  const review = await reviewPackage({
    grant,
    sections,
    budget,
    checklist,
    profileGaps: profile.gaps,
    organizationType: profile.organizationType,
  });

  await prisma.application.update({ where: { id: application.id }, data: { review: review as any } });
  return NextResponse.json({ review });
}
