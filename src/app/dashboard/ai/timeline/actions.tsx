"use server";

import { prisma } from "@/lib/prisma";

type TimelineInput = {
  grantId: string;
  workspaceId: string;
  userId: string;
};

export async function generateTimelineAnalysis({
  grantId,
  workspaceId,
  userId
}: TimelineInput) {
  const grant = await prisma.grant.findUnique({
    where: { id: grantId },
    include: {
      GrantSection: true,
      narratives: true,
      applications: true
    }
  });

  if (!grant) {
    throw new Error("Grant not found");
  }

  // Extract timeline phases from real fields
  const lifecycleTimeline = `
Grant Lifecycle Timeline
------------------------
Posted: ${grant.postedDate ?? "Unknown"}
Open: ${grant.openDate ?? "Unknown"}
Deadline: ${grant.deadline ?? "Unknown"}
Updated: ${grant.updatedDate ?? "Unknown"}
`.trim();

  const sectionTimeline =
    grant.GrantSection.length > 0
      ? grant.GrantSection
          .sort((a, b) => a.order - b.order)
          .map(
            (s) =>
              `Section ${s.order}: ${s.title} — ${s.content?.slice(0, 120) ?? "No content"}`
          )
          .join("\n")
      : "No sections available.";

  const narrativeTimeline =
    grant.narratives.length > 0
      ? grant.narratives
          .map(
            (n) =>
              `Narrative (${n.createdAt.toLocaleDateString()}): ${n.content?.slice(0, 120) ?? "No content"}`
          )
          .join("\n")
      : "No narratives available.";

  const applicationTimeline =
    grant.applications.length > 0
      ? grant.applications
          .map(
            (a) =>
              `Application (${a.updatedAt?.toLocaleDateString() ?? a.createdAt.toLocaleDateString()}): ${a.content?.slice(0, 120) ?? "No content"}`
          )
          .join("\n")
      : "No applications available.";

  // AI scoring fields mapped to timeline scoring
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

  const timelineText = `
Grant Timeline Analysis
=======================

Lifecycle
---------
${lifecycleTimeline}

Sections
--------
${sectionTimeline}

Narratives
----------
${narrativeTimeline}

Applications
------------
${applicationTimeline}

Scores
------
Fit: ${fitScore ?? "N/A"}
Readiness: ${readinessScore ?? "N/A"}
Competitiveness: ${competitivenessScore ?? "N/A"}
Alignment: ${alignmentScore ?? "N/A"}
Risk: ${riskScore ?? "N/A"}
Overall: ${Number.isFinite(overallScore) ? overallScore.toFixed(2) : "N/A"}
`.trim();

  // Log into real history model: GrantEvidenceHistory
  await prisma.grantEvidenceHistory.create({
    data: {
      workspaceId,
      userId,
      grantId,
      evidenceStrength: fitScore ?? 0,
      evidenceRelevance: readinessScore ?? 0,
      evidenceSufficiency: competitivenessScore ?? 0,
      evidenceConsistency: alignmentScore ?? 0,
      evidenceQuality: riskScore ?? 0,
      evidenceAlignment: alignmentScore ?? 0,
      overall: Number.isFinite(overallScore) ? Math.round(overallScore) : 0,
      analysis: timelineText,
      strengthFactors: "Fit score derived from alignment and structure.",
      relevanceFactors: "Readiness score reflects timeline readiness.",
      sufficiencyFactors: "Competitiveness score approximated from grant AI fields.",
      consistencyFactors: "Alignment score reflects consistency.",
      qualityFactors: "Risk score reflects quality and risk.",
      alignmentFactors: "Alignment score reused for evidence alignment.",
      strategy: "AI‑assisted timeline analysis."
    }
  });

  return {
    timelineText,
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
