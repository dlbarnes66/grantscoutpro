import { fetchFoundations } from "./fetchFoundations";
import { normalizeFoundation } from "./normalizeFoundation";
import { prisma } from "@/lib/prisma";

export async function syncFoundations() {
  const raw = await fetchFoundations();
  const normalized = raw.map((f: any) => normalizeFoundation(f));

  for (const grant of normalized) {
    await prisma.grant.upsert({
      where: {
        id: grant.foundationEIN || grant.title,
      },
      update: grant,
      create: {
        id: grant.foundationEIN || grant.title,
        ...grant,
      },
    });
  }

  return normalized.length;
}
