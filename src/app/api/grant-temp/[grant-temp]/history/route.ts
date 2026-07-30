import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: any) {
  const { grantId } = params;

  const models = [
    // Core history models
    "postAwardHistory",
    "renewalHistory",
    "reviewerHistory",
    "riskHistory",
    "submissionHistory",
    "writingCoachHistory",
    "forecastHistory",
    "matchingHistory",
    "opportunityHistory",
    "rewriteHistory",
    "panelHistory",
    "gapsHistory",
    "narrativeHistory",
    "agentHistory",
    "complianceHistory",
    "closeoutHistory",
    "eligibilityHistory",
    "autoeditorHistory",
    "successProbabilityHistory",
    "compareHistory",
    "portfolioHistory",
    "negotiationHistory",
    "monitoringHistory",
    "outreachHistory",
    "budgetHistory",

    // AI history models
    "grantTruthfulnessHistory",
    "grantEvidenceHistory",
    "grantCompletenessHistory",
    "grantQualityHistory",
    "grantOptimizationHistory",
    "grantEnhancementHistory",
    "grantAuditHistory",
    "grantReviewerHistory",
    "grantDecisionHistory",
  ];

  const history: any[] = [];

  for (const model of models) {
    const entries = await prisma[model].findMany({
      where: { grantId },
      orderBy: { createdAt: "desc" },
    });

    for (const entry of entries) {
      history.push({
        id: entry.id,
        type: model,
        createdAt: entry.createdAt,
        summary: entry.notes || entry.action || entry.status || entry.analysis || null,
        details:
          entry.content ||
          entry.original ||
          entry.rewritten ||
          entry.opportunity ||
          entry.panel ||
          entry.gaps ||
          entry.agent ||
          entry.compliance ||
          entry.closeout ||
          entry.eligibility ||
          entry.edits ||
          entry.negotiation ||
          entry.monitoring ||
          entry.outreach ||
          entry.portfolio ||
          entry.reviewer ||
          entry.riskLevel ||
          entry.forecast ||
          entry.matchScore ||
          entry.budget ||
          null,
      });
    }
  }

  // Sort unified timeline
  history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json(history);
}
