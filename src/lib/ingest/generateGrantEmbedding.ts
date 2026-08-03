import { prisma } from "@/lib/prisma";

export async function generateGrantEmbedding(grantId: string) {
  const grant = await prisma.grant.findUnique({ where: { id: grantId } });

  if (!grant) return null;

  const text = [
    grant.title,
    grant.summary,
    grant.description,
    grant.agency,
    grant.category,
    grant.industry,
    grant.location,
    grant.eligibleStates,
    grant.geographicFocus,
    grant.eligibleApplicants,
  ]
    .filter(Boolean)
    .join("\n");

  // Mock embedding — replace with real model later
  const embedding = Array.from({ length: 128 }).map(
    () => Math.random() * 2 - 1
  );

  await prisma.grant.update({
    where: { id: grantId },
    data: { embedding },
  });

  return embedding;
}
