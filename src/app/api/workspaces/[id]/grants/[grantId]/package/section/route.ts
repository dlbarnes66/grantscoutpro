import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertGrantWorkspaceAccess } from "@/lib/ai/negotiation";
import { guardPackageAI, runWithAiWorkspace } from "@/lib/ai/packageAiGuard";
import { packageActionAllowed, parseSections, parseWorkPlan } from "@/lib/ai/packageContext";
import {
  EXECUTIVE_SUMMARY,
  SUSTAINABILITY_PLAN,
  generateExecutiveSummary,
  generateSustainabilityPlan,
  upsertSection,
} from "@/lib/ai/packageSections";
import { buildWorkPlanTemplate, renderWorkPlanText, WORK_PLAN_TITLE } from "@/lib/ai/workPlan";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

type Params = { id: string; grantId: string };

// POST { title } - (re)build one section of the saved draft.
//   "Executive Summary"   AI, written from the rest of the saved draft
//   "Sustainability Plan" AI, written from the program, budget and profile
//   "Work Plan & Timeline" the editable template (body.reset replaces an existing plan)
// Works for adding a section an older draft doesn't have yet, too. The
// browser saves pending edits first, because this reads the saved draft.
async function handlePost(req: NextRequest, context: { params: Promise<Params> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const params = await context.params;
  if (!(await assertGrantWorkspaceAccess(params.id, params.grantId, userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const title = typeof body.title === "string" ? body.title : "";
  if (![EXECUTIVE_SUMMARY, SUSTAINABILITY_PLAN, WORK_PLAN_TITLE].includes(title)) {
    return NextResponse.json({ error: "That section can't be generated here." }, { status: 400 });
  }

  const aiSection = title !== WORK_PLAN_TITLE;
  if (aiSection && !(await packageActionAllowed("section", userId, 30))) {
    return NextResponse.json({ error: "Too many generations this hour. Please try again later." }, { status: 429 });
  }

  const application = await prisma.application.findFirst({ where: { workspaceId: params.id, grantId: params.grantId } });
  if (!application) return NextResponse.json({ error: "Generate the submission package first." }, { status: 404 });
  if (application.status === "ready") {
    return NextResponse.json({ error: "This package is finalized. Click Edit Again first." }, { status: 400 });
  }

  let sections = parseSections(application.content);
  let workPlan = parseWorkPlan(application.content);

  if (title === WORK_PLAN_TITLE) {
    if (!workPlan || body.reset === true) {
      workPlan = buildWorkPlanTemplate(workPlan?.durationMonths ?? 12, workPlan?.startDate ?? null);
    }
    sections = upsertSection(sections, WORK_PLAN_TITLE, renderWorkPlanText(workPlan));
  } else {
  const aiGuard = await guardPackageAI(params.id);
  if (aiGuard) return aiGuard;
    const grant = await prisma.grant.findUnique({ where: { id: params.grantId } });
    const workspace = await prisma.workspace.findUnique({ where: { id: params.id }, select: { ownerId: true } });
    const profile = workspace ? await prisma.userProfile.findUnique({ where: { userId: workspace.ownerId } }) : null;
    if (!grant || !profile) {
      return NextResponse.json({ error: "Complete your organization profile first." }, { status: 400 });
    }
    const ctx = { grant, profile, sections, budget: application.budget as any, workPlan };
    const text = title === EXECUTIVE_SUMMARY ? await generateExecutiveSummary(ctx) : await generateSustainabilityPlan(ctx);
    if (!text) {
      return NextResponse.json({ error: "The AI couldn't write this section just now. Please try again in a minute." }, { status: 502 });
    }
    sections = upsertSection(sections, title, text);
  }

  await prisma.application.update({
    where: { id: application.id },
    data: { content: JSON.stringify({ sections, workPlan }) },
  });

  return NextResponse.json({ sections, workPlan });
}

// Runs the handler with this workspace in scope so every OpenAI call made
// underneath is counted against the workspace's monthly AI allowance
// (see lib/ai/packageAiGuard.ts).
export async function POST(req: NextRequest, context: { params: Promise<Params> }) {
  const { id } = await context.params;
  return runWithAiWorkspace(id, () => handlePost(req, context));
}
