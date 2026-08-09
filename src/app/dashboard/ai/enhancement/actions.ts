"use server";

import { prisma } from "@/lib/prisma";

export async function generateGrantEnhancement(
  grantId: string,
  workspaceId: string,
  userId: string
) {
  // Load grant with narratives only (no sections include)
  const grant = await prisma.grant.findUnique({
    where: { id: grantId },
    include: {
      narratives: true,
    },
  });

  if (!grant) {
    throw new Error("Grant not found");
  }

  const narrativeText = grant.narratives
    .map((n) => n.content ?? "")
    .filter((c) => c.length > 0)
    .join("\n\n");

  // TODO: plug in real AI enhancement logic here.
  // For now, we create a stubbed history entry so the platform builds and runs.
  const enhancement = await prisma.grantEnhancementHistory.create({
    data: {
      workspaceId,
      userId,
      grantId,
      narrativeEnhancement: 0,
      structuralEnhancement: 0,
      persuasiveEnhancement: 0,
      complianceEnhancement: 0,
      evidenceEnhancement: 0,
      strategicEnhancement: 0,
      overall: 0,
      analysis: "Enhancement analysis not yet implemented.",
      narrativeFactors: narrativeText || "No narrative content found.",
      structuralFactors: "",
      persuasiveFactors: "",
      complianceFactors: "",
      evidenceFactors: "",
      strategicFactors: "",
      strategy: "",
    },
  });

  return enhancement;
}
