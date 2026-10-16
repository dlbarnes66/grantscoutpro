import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertGrantWorkspaceAccess } from "@/lib/ai/negotiation";
import { scoreGrantMatch } from "@/lib/ai/grantMatch";
import { generateProposalSections } from "@/lib/ai/proposalPackage";
import { generateGrantBudget } from "@/lib/ai/budgetBuilder";
import {
  EXECUTIVE_SUMMARY,
  SUSTAINABILITY_PLAN,
  generateExecutiveSummary,
  generateSustainabilityPlan,
  upsertSection,
  orderSections,
} from "@/lib/ai/packageSections";
import { buildWorkPlanTemplate, renderWorkPlanText, WORK_PLAN_TITLE } from "@/lib/ai/workPlan";
import { parseWorkPlan } from "@/lib/ai/packageContext";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 120;

type Params = { id: string; grantId: string };

// Runs the full "AI takes control" pass for a grant: scores it if it
// hasn't been scored yet, drafts the core narrative sections and a
// line-item budget in parallel, adds the Work Plan & Timeline template,
// then writes the Sustainability Plan and finally the Executive Summary
// from the finished draft (so the summary agrees with everything else).
// Saves it all as a draft Application the user reviews and edits before
// finalizing (see .../package/finalize). Re-running this overwrites the
// previous draft, so the frontend should confirm before calling it again
// on an already-generated package.
export async function POST(_req: NextRequest, context: { params: Promise<Params> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = await context.params;
  const hasAccess = await assertGrantWorkspaceAccess(params.id, params.grantId, userId);
  if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const grant = await prisma.grant.findUnique({ where: { id: params.grantId } });
  if (!grant || grant.workspaceId !== params.id) {
    return NextResponse.json({ error: "Grant not found" }, { status: 404 });
  }

  const workspace = await prisma.workspace.findUnique({ where: { id: params.id }, select: { ownerId: true } });
  const profile = workspace ? await prisma.userProfile.findUnique({ where: { userId: workspace.ownerId } }) : null;

  if (!profile) {
    return NextResponse.json(
      { error: "This workspace doesn't have an organization profile yet - complete onboarding first." },
      { status: 400 }
    );
  }

  let rationale = grant.aiSummary || "";
  if (grant.aiEligibilityScore === null) {
    const match = await scoreGrantMatch(profile, grant);
    rationale = match.rationale;
    await prisma.grant.update({
      where: { id: grant.id },
      data: {
        aiEligibilityScore: match.score,
        aiSummary: match.rationale,
        aiRecommendations: { whatsNeeded: match.whatsNeeded },
      },
    });
  }

  const existing = await prisma.application.findFirst({ where: { workspaceId: params.id, grantId: params.grantId } });

  const [coreSections, budget] = await Promise.all([
    generateProposalSections(grant, profile, rationale),
    generateGrantBudget(grant, profile),
  ]);

  let sections = coreSections;
  // Keep the project length and start date from an earlier plan if there was one.
  const priorPlan = parseWorkPlan(existing?.content);
  const workPlan = coreSections.length > 0 ? buildWorkPlanTemplate(priorPlan?.durationMonths ?? 12, priorPlan?.startDate ?? null) : null;

  if (workPlan) {
    sections = upsertSection(sections, WORK_PLAN_TITLE, renderWorkPlanText(workPlan));

    const ctx = { grant, profile, sections, budget, workPlan };
    const sustain = await generateSustainabilityPlan(ctx);
    sections = upsertSection(
      sections,
      SUSTAINABILITY_PLAN,
      sustain ?? '[The Sustainability Plan could not be generated just now. Use "Generate with AI" on this section to try again.]'
    );

    const summary = await generateExecutiveSummary({ ...ctx, sections });
    sections = upsertSection(
      sections,
      EXECUTIVE_SUMMARY,
      summary ?? '[The Executive Summary could not be generated just now. Use "Generate with AI" on this section to try again.]'
    );
    sections = orderSections(sections);
  }

  const content = JSON.stringify({ sections, workPlan });

  const application = existing
    ? await prisma.application.update({
        where: { id: existing.id },
        data: { content, budget, status: "draft" },
      })
    : await prisma.application.create({
        data: { userId, grantId: params.grantId, workspaceId: params.id, content, budget, status: "draft" },
      });

  return NextResponse.json({ status: application.status, sections, workPlan, budget });
}
