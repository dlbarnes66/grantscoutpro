import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: any) {
  const { grantId } = params;

  const history = [];

  const models = [
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

  for (const model of models) {
    const entries = await prisma[model].findMany({
      where: { grantId },
      orderBy: { createdAt: "desc" },
    });

    history.push(
      ...entries.map((e) => ({
        id: e.id,
        type: model,
        createdAt: e.createdAt,
        analysis: e.analysis,
      }))
    );
  }

  return NextResponse.json(history);
}
