"use server";

import { prisma } from "@/lib/prisma";

type RiskInput = {
  grantId: string;
  workspaceId: string;
  userId: string;
};

export async function generateRiskAnalysis({
  grantId,
  workspaceId,
  userId
}: RiskInput) {
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

  // Load workspace owner profile (UserProfile)
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      owner: {
        include: {
          profile: true
        }
      }
    }
  });

  const profile = workspace?.owner?.profile;

  const profileSummary = profile
    ? `
Organization Name: ${profile.organizationName ?? "Unknown"}
Mission: ${profile.mission ?? "Unknown"}
Staff Size: ${profile.staffSize ?? "Unknown"}
Annual Budget: ${profile.annualBudget ?? "Unknown"}
Past Grants: ${profile.pastGrants ?? "Unknown"}
Past Wins: ${profile.pastWins ?? "Unknown"}
Past Losses: ${profile.pastLosses ?? "Unknown"}
Focus Areas: ${profile.focusAreas?.join(", ") ?? "None"}
Populations Served: ${profile.populationsServed?.join(", ") ?? "None"}
Geographic Service: ${profile.geographicService?.join(", ") ?? "None"}
`.trim()
    : "No organization profile available.";

  // AI scoring fields mapped to risk analysis
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

  const riskText = `
Grant Risk Analysis
===================

Organization Profile
--------------------
${profileSummary}

Grant Scores
------------
Fit: ${fitScore ?? "N/A"}
Readiness: ${readinessScore ?? "N/A"}
Competitiveness: ${competitivenessScore ?? "N/A"}
Alignment: ${alignmentScore ?? "N/A"}
Risk: ${riskScore ?? "N/A"}
Overall Risk Score: ${
    Number.isFinite(overallScore) ? overallScore.toFixed(2) : "N/A"
  }

Narratives
----------
${
  grant.narratives.length > 0
    ? grant.narratives
        .map(
          (n) =>
            `Narrative (${n.createdAt.toLocaleDateString()}): ${n.content?.slice(
              0,
              120
            ) ?? "No content"}`
        )
        .join("\n")
    : "No narratives available."
}

Sections
--------
${
  grant.GrantSection.length > 0
    ? grant.GrantSection.map(
        (s) =>
          `Section ${s.order}: ${s.title} — ${
            s.content?.slice(0, 120) ?? "No content"
          }`
      ).join("\n")
    : "No sections available."
}

Applications
------------
${
  grant.applications.length > 0
    ? grant.applications
        .map(
          (a) =>
            `Application (${a.updatedAt?.toLocaleDateString() ?? a.createdAt.toLocaleDateString()}): ${a.content?.slice(0, 120) ?? "No content"}`
        )
        .join("\n")
    : "No applications available."
}
`.trim();

  // Log into real history model: RiskHistory
  await prisma.riskHistory.create({
    data: {
      workspaceId,
      userId,
      grantId,
      riskLevel: riskScore?.toString() ?? "Unknown",
      notes: riskText
    }
  });

  return {
    riskText,
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
