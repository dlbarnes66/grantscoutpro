import { fetchStateGrants } from "./fetchStateGrants";
import { normalizeStateGrant } from "./normalizeStateGrant";
import { prisma } from "@/lib/prisma";

export async function syncStateGrants() {
  const raw = await fetchStateGrants();
  const normalized = raw.map((g: any) => normalizeStateGrant(g));

  for (const grant of normalized) {
    await prisma.grant.upsert({
      where: {
        id: grant.raw?.id || grant.title,
      },
      update: grant,
      create: {
        id: grant.raw?.id || grant.title,
        ...grant,
      },
    });
  }

  return normalized.length;
}
