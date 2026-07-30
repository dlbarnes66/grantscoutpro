import { prisma } from "@/lib/prisma";

export async function getComparison(grantId: string) {
  const comparison = await prisma.grantComparison.findUnique({
    where: { id: grantId },
  });

  if (!comparison) return null;

  // "grants" is a JSON field, not "grantIds".
  // It must be parsed and validated.
  let grantIds: string[] = [];

  if (Array.isArray(comparison.grants)) {
    grantIds = comparison.grants as string[];
  } else {
    try {
      grantIds = JSON.parse(comparison.grants as any);
    } catch {
      grantIds = [];
    }
  }

  // Fetch the grant records using the parsed IDs
  const grants = await prisma.grant.findMany({
    where: { id: { in: grantIds } },
  });

  return {
    comparison,
    grants,
  };
}
