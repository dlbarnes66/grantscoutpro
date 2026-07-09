import { fetchFederalGrants } from "./fetchFederalGrants";
import { normalizeFederalGrant } from "./normalizeFederalGrant";
import { prisma } from "@/lib/prisma";

export async function syncFederalGrants() {
  const raw = await fetchFederalGrants();
  const normalized = raw.map((g: any) => normalizeFederalGrant(g));

  for (const grant of normalized) {
    await prisma.grant.upsert({
      where: {
        id: grant.raw?.opportunityNumber || grant.title,
      },
      update: grant,
      create: {
        id: grant.raw?.opportunityNumber || grant.title,
        ...grant,
      },
    });
  }

  return normalized.length;
}
