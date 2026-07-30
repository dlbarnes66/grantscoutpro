import { prisma } from "@/lib/prisma";

export async function loadHistory(grantId: string) {
  const models = [
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
    "truthfulnessHistory",
    "evidenceHistory",
    "completenessHistory",
    "qualityHistory",
    "optimizationHistory",
    "enhancementHistory",
    "auditHistory",
    "grantReviewerHistory",
    "decisionHistory",
  ];

  const results: any[] = [];

  for (const model of models) {
    const client = (prisma as any)[model];
    if (!client) continue;

    const rows = await client.findMany({
      where: { grantId },
      orderBy: { createdAt: "desc" },
    });

    for (const row of rows) {
      results.push({
        type: model,
        createdAt: row.createdAt,
        data: row,
      });
    }
  }

  results.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return results;
}
