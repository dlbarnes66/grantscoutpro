import { prisma } from "@/lib/prisma";

/**
 * Logs grant history events into the correct Prisma models.
 * This version is fully aligned with your current Prisma schema.
 */

export async function logGrantHistory({
  grantId,
  userId,
  workspaceId,
  context,
}: {
  grantId: string;
  userId?: string | null;
  workspaceId?: string | null;
  context: any;
}) {
  try {
    // ─────────────────────────────────────────────
    // 1. OpportunityHistory (NO action, NO notes)
    // ─────────────────────────────────────────────
    await prisma.opportunityHistory.create({
      data: {
        grantId,
        userId: userId ?? "",
        opportunity: context?.type
          ? `Grant opportunity: ${context.type}`
          : "Grant opportunity logged",
      },
    });

    // ─────────────────────────────────────────────
    // 2. ForecastHistory (NO notes field)
    // ─────────────────────────────────────────────
    await prisma.forecastHistory.create({
      data: {
        grantId,
        userId: userId ?? "",
        forecast: "AI forecast generated",
        score: context?.aiResult?.aiEligibilityScore ?? 0,
      },
    });

    // ─────────────────────────────────────────────
    // 3. EligibilityHistory (eligibility + notes allowed)
    // ─────────────────────────────────────────────
    await prisma.eligibilityHistory.create({
      data: {
        grantId,
        userId: userId ?? "",
        eligibility: String(context?.aiResult?.aiEligibilityScore ?? ""),
        notes: "Eligibility score logged",
      },
    });

    // ─────────────────────────────────────────────
    // 4. RiskHistory (riskLevel + notes)
    // ─────────────────────────────────────────────
    await prisma.riskHistory.create({
      data: {
        grantId,
        userId: userId ?? "",
        riskLevel: context?.aiResult?.aiRiskScore
          ? String(context.aiResult.aiRiskScore)
          : null,
        notes: "Risk score logged",
      },
    });

    // ─────────────────────────────────────────────
    // 5. MatchingHistory (matchScore + notes)
    // ─────────────────────────────────────────────
    await prisma.matchingHistory.create({
      data: {
        grantId,
        userId: userId ?? "",
        matchScore: context?.aiResult?.aiAlignmentScore ?? null,
        notes: "Alignment score logged",
      },
    });

    // ─────────────────────────────────────────────
    // 6. SubmissionHistory (status + notes)
    // ─────────────────────────────────────────────
    await prisma.submissionHistory.create({
      data: {
        grantId,
        userId: userId ?? "",
        status: "logged",
        notes: "Submission event logged",
      },
    });

    // ─────────────────────────────────────────────
    // 7. ReviewerHistory (reviewer + comments)
    // ─────────────────────────────────────────────
    await prisma.reviewerHistory.create({
      data: {
        grantId,
        userId: userId ?? "",
        reviewer: "AI Reviewer",
        comments: "Reviewer analysis logged",
      },
    });

    // ─────────────────────────────────────────────
    // 8. NarrativeHistory (section + content)
    // ─────────────────────────────────────────────
    await prisma.narrativeHistory.create({
      data: {
        grantId,
        userId: userId ?? "",
        section: "AI Summary",
        content: context?.aiResult?.aiSummary ?? "",
      },
    });

    // ─────────────────────────────────────────────
    // 9. BudgetHistory (category + amount)
    // ─────────────────────────────────────────────
    await prisma.budgetHistory.create({
      data: {
        grantId,
        userId: userId ?? "",
        category: "AI Budget",
        amount: context?.aiResult?.aiReadinessScore ?? null,
      },
    });

    // ─────────────────────────────────────────────
    // 10. SuccessProbabilityHistory (probability + notes)
    // ─────────────────────────────────────────────
    await prisma.successProbabilityHistory.create({
      data: {
        grantId,
        userId: userId ?? "",
        probability: context?.aiResult?.aiCompetitivenessScore ?? null,
        notes: "Competitiveness score logged",
      },
    });

    // ─────────────────────────────────────────────
    // 11. CompareHistory (comparison JSON)
    // ─────────────────────────────────────────────
    await prisma.compareHistory.create({
      data: {
        grantId,
        userId: userId ?? "",
        comparison: context?.comparison ?? {},
      },
    });

    // ─────────────────────────────────────────────
    // 12. PortfolioHistory (portfolio JSON)
    // ─────────────────────────────────────────────
    await prisma.portfolioHistory.create({
      data: {
        grantId,
        userId: userId ?? "",
        portfolio: context?.portfolio ?? {},
      },
    });

    return { success: true };
  } catch (err) {
    console.error("Error logging grant history:", err);
    return { success: false, error: err };
  }
}
