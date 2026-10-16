import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertGrantWorkspaceAccess } from "@/lib/ai/negotiation";
import { parseWorkPlan } from "@/lib/ai/packageContext";
import { upsertSection } from "@/lib/ai/packageSections";
import { renderWorkPlanText, sanitizeWorkPlan, WORK_PLAN_TITLE } from "@/lib/ai/workPlan";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string; grantId: string };

export async function POST(req: NextRequest, context: { params: Promise<Params> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = await context.params;
  const hasAccess = await assertGrantWorkspaceAccess(params.id, params.grantId, userId);
  if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const existing = await prisma.application.findFirst({ where: { workspaceId: params.id, grantId: params.grantId } });
  if (!existing) {
    return NextResponse.json({ error: "No package to save yet - generate one first." }, { status: 404 });
  }
  if (existing.status === "ready") {
    return NextResponse.json({ error: "This package is already finalized." }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  let sections: { title: string; content: string }[] = Array.isArray(body.sections) ? body.sections : [];
  const budget = body.budget ?? existing.budget;

  // The work plan is structured data kept beside the narrative sections.
  // When one exists, the "Work Plan & Timeline" section text is always
  // re-rendered from it here, so the stored text can never drift from the
  // table the user edited.
  const workPlan = "workPlan" in body ? sanitizeWorkPlan(body.workPlan) : parseWorkPlan(existing.content);
  if (workPlan) sections = upsertSection(sections, WORK_PLAN_TITLE, renderWorkPlanText(workPlan));

  const application = await prisma.application.update({
    where: { id: existing.id },
    data: { content: JSON.stringify({ sections, workPlan }), budget },
  });

  return NextResponse.json({ status: application.status, updatedAt: application.updatedAt, sections, workPlan });
}
