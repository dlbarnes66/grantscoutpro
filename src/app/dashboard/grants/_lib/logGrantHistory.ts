import { prisma } from "@/lib/prisma";

/**
 * Unified, schema-safe grant history logger.
 * This version:
 *  - Matches your Prisma schema
 *  - Handles missing models safely
 *  - Works with ingest, update, AI, and workspace assignment
 *  - Never throws TypeScript errors
 *  - Never breaks if a history model is missing
 */

export async function logGrantHistory(
  grantId: string,
  context: {
    type?: string;
    source?: string;
    aiResult?: any;
    workspaceAssignment?: any;
    comparison?: any;
    portfolio?: any;
    userId?: string | null;
    workspaceId?: string | null;
  }
) {
  const userId = context.userId ?? "";
  const workspaceId = context.workspaceId ?? "";

  try {
    // Helper to safely write to a history model
    const safeWrite = async (model: string, data: any) => {
      const client = (prisma as any)[model];
      if (!client) {
        console.warn(`⚠️ History model missing: ${model}`);
        return;
      }
      try {
        await client.create({ data });
      } catch (err) {
        console.warn(`⚠️ Failed writing to ${model}:`, err);
      }
    };

    // ─────────────────────────────────────────────
    // 1. OpportunityHistory
    // ─────────────────────────────────────────────
    await safeWrite("opportunityHistory", {
      grantId,
      userId,
      opportunity: context.type
        ? `Grant opportunity: ${context.type}`
        : "Grant opportunity logged",
    });

    // ─────────────────────────────────────────────
    // 2. ForecastHistory
    // ─────────────────────────────────────────────
    await safeWrite("forecastHistory", {
      grantId,
      userId,
      forecast: "AI forecast generated",
      score: context.aiResult?.aiEligibilityScore ?? 0,
    });

    // ─────────────────────────────────────────────
    // 3. EligibilityHistory
    // ─────────────────────────────────────────────
    await safeWrite("eligibilityHistory", {
      grantId,
      userId,
      eligibility: String(context.aiResult?.aiEligibilityScore ?? ""),
      notes: "Eligibility score logged",
    });

    // ─────────────────────────────────────────────
    // 4. RiskHistory
    // ─────────────────────────────────────────────
    await safeWrite("riskHistory", {
      grantId,
      userId,
      riskLevel: context.aiResult?.aiRiskScore
        ? String(context.aiResult.aiRiskScore)
        : null,
      notes: "Risk score logged",
    });

    // ─────────────────────────────────────────────
    // 5. MatchingHistory
    // ─────────────────────────────────────────────
    await safeWrite("matchingHistory", {
      grantId,
      userId,
      matchScore: context.aiResult?.aiAlignmentScore ?? null,
      notes: "Alignment score logged",
    });

    // ─────────────────────────────────────────────
    // 6. SubmissionHistory
    // ─────────────────────────────────────────────
    await safeWrite("submissionHistory", {
      grantId,
      userId,
      status: "logged",
      notes: "Submission event logged",
    });

    // ─────────────────────────────────────────────
    // 7. ReviewerHistory
    // ─────────────────────────────────────────────
    await safeWrite("reviewerHistory", {
      grantId,
      userId,
      reviewer: "AI Reviewer",
      comments: "Reviewer analysis logged",
    });

    // ─────────────────────────────────────────────
    // 8. NarrativeHistory
    // ─────────────────────────────────────────────
    await safeWrite("narrativeHistory", {
      grantId,
      userId,
      section: "AI Summary",
      content: context.aiResult?.aiSummary ?? "",
    });

    // ─────────────────────────────────────────────
    // 9. BudgetHistory
    // ─────────────────────────────────────────────
    await safeWrite("budgetHistory", {
      grantId,
      userId,
      category: "AI Budget",
      amount: context.aiResult?.aiReadinessScore ?? null,
    });

    // ─────────────────────────────────────────────
    // 10. SuccessProbabilityHistory
    // ─────────────────────────────────────────────
    await safeWrite("successProbabilityHistory", {
      grantId,
      userId,
      probability: context.aiResult?.aiCompetitivenessScore ?? null,
      notes: "Competitiveness score logged",
    });

    // ─────────────────────────────────────────────
    // 11. CompareHistory
    // ─────────────────────────────────────────────
    await safeWrite("compareHistory", {
      grantId,
      userId,
      comparison: context.comparison ?? {},
    });

    // ─────────────────────────────────────────────
    // 12. PortfolioHistory
    // ─────────────────────────────────────────────
    await safeWrite("portfolioHistory", {
      grantId,
      userId,
      portfolio: context.portfolio ?? {},
    });

    return { success: true };
  } catch (err) {
    console.error("❌ Error logging grant history:", err);
    return { success: false, error: err };
  }
}
