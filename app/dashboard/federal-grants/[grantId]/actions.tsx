// app/dashboard/federal-grants/[grantId]/actions.tsx
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ⭐ Load grant with raw JSON
async function loadGrant(grantId: string) {
  return prisma.grant.findUnique({
    where: { id: grantId },
    select: { raw: true },
  });
}

// ⭐ Generate AI Scores
export async function generateGrantScores(grantId: string, scores: any) {
  const grant = await loadGrant(grantId);
  if (!grant) throw new Error("Grant not found");

  const rawObject =
    grant.raw && typeof grant.raw === "object" && !Array.isArray(grant.raw)
      ? grant.raw
      : {};

  const updated = await prisma.grant.update({
    where: { id: grantId },
    data: {
      raw: {
        ...rawObject,
        aiScores: scores,
      },
    },
  });

  revalidatePath(`/dashboard/federal-grants/${grantId}`);
  return updated;
}

// ⭐ Generate AI Summary
export async function generateAISummary(grantId: string, summary: string) {
  const grant = await loadGrant(grantId);
  if (!grant) throw new Error("Grant not found");

  const rawObject =
    grant.raw && typeof grant.raw === "object" && !Array.isArray(grant.raw)
      ? grant.raw
      : {};

  const updated = await prisma.grant.update({
    where: { id: grantId },
    data: {
      raw: {
        ...rawObject,
        aiSummary: summary,
      },
    },
  });

  revalidatePath(`/dashboard/federal-grants/${grantId}`);
  return updated;
}
