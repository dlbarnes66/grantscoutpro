"use server";

import { prisma } from "@/lib/prisma";

type StrategyInput = {
  grantId: string;
  workspaceId: string;
  userId: string;
};

export async function generateStrategyAnalysis({
  grantId,
  workspaceId,
  userId
}: StrategyInput) {
  // Load grant with related data that actually exists in your schema
  const grant = await prisma.grant.findUnique({
    where: { id: grantId },
    include: {
      narratives: true,
      GrantSection: true,
      applications: true
    }
  });

  if (!grant) {
    throw new Error("Grant not found");
  }

  // Map existing AI fields to the scores you want to show
  const fitScore = grant.aiAlignmentScore ?? null;
  const readinessScore = grant.aiReadinessScore ?? null;
  const competitivenessScore = grant.aiCompetitivenessScore ?? null;
  const alignmentScore = grant.aiEligibilityScore ?? null;
  const riskScore = grant.aiRiskScore ?? null;

  const overallScore =
    [
      fitScore,
      readinessScore,
      competitivenessScore,
      alignmentScore,
      riskScore
    ]
      .filter((v) => typeof v === "number")
      .reduce((sum, v) => sum + (v as number), 0) /
    ([
      fitScore,
      readinessScore,
      competitivenessScore,
      alignmentScore,
      riskScore
    ].filter((v) => typeof v === "number").length || 1);

  // Build a human‑readable strategy summary
  const sectionsSummary =
    grant.GrantSection.length > 0
      ? grant.GrantSection.map(
          (s) => `- ${s.title}: ${s.content ?? "No content"}`
        ).join("\n")
      : "No structured sections available.";

  const narrativesSummary =
    grant.narratives.length > 0
      ? grant.narratives
          .map((n) => `- Narrative: ${n.content ?? "No content"}`)
          .join("\n")
      : "No narratives available.";

  const applicationsSummary =
    grant.applications.length > 0
      ? grant.applications
          .map(
            (a) =>
              `- Application ${a.id}: ${a.content?.slice(0, 120) ?? "No content"}`
          )
          .join("\n")
      : "No applications submitted.";

  const strategyText = `
Grant Strategy Overview
=======================

Title: ${grant.title}
Agency: ${grant.agency ?? "Unknown"}
Category: ${grant.category ?? "Uncategorized"}

Scores
------
Fit: ${fitScore ?? "N/A"}
Readiness: ${readinessScore ?? "N/A"}
Competitiveness: ${competitivenessScore ?? "N/A"}
Alignment: ${alignmentScore ?? "N/A"}
Risk: ${riskScore ?? "N/A"}
Overall: ${Number.isFinite(overallScore) ? overallScore.toFixed(2) : "N/A"}

Sections
--------
${sectionsSummary}

Narratives
----------
${narrativesSummary}

Applications
------------
${applicationsSummary}
`.trim();

  // Log into a real history model that exists in your schema
  await prisma.grantOptimizationHistory.create({
    data: {
      workspaceId,
      userId,
      grantId,
      narrativeOptimization: fitScore ?? 0,
      budgetOptimization: competitivenessScore ?? 0,
      timelineOptimization: readinessScore ?? 0,
      strategyOptimization: alignmentScore ?? 0,
      complianceOptimization: riskScore ?? 0,
      readinessOptimization: readinessScore ?? 0,
      overall: Number.isFinite(overallScore) ? Math.round(overallScore) : 0,
      analysis: strategyText,
      narrativeFactors: "Fit score derived from alignment and narratives.",
      budgetFactors: "Competitiveness score approximated from grant AI fields.",
      timelineFactors: "Readiness score reflects timeline readiness.",
      strategyFactors: "Alignment score reflects strategic fit.",
      complianceFactors: "Risk score reflects compliance and risk.",
      readinessFactors: "Readiness score reused for readiness optimization.",
      strategy: "AI‑assisted grant strategy analysis."
    }
  });

  return {
    strategyText,
    scores: {
      fitScore,
      readinessScore,
      competitivenessScore,
      alignmentScore,
      riskScore,
      overallScore: Number.isFinite(overallScore) ? overallScore : null
    }
  };
}
