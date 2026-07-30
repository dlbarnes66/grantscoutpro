import { prisma } from "@/lib/prisma";

export async function dedupeGrant(payload: any) {
  // 1) URL-based dedupe (if raw has url)
  const url = payload.raw?.url ?? payload.raw?.link ?? null;
  if (url) {
    const byUrl = await prisma.grant.findFirst({
      where: { raw: { path: ["url"], equals: url } },
    });
    if (byUrl) return byUrl;
  }

  // 2) Title + agency + deadline
  if (payload.title && payload.agency && payload.dates.deadline) {
    const byCombo = await prisma.grant.findFirst({
      where: {
        title: payload.title,
        agency: payload.agency,
        deadline: payload.dates.deadline,
      },
    });
    if (byCombo) return byCombo;
  }

  // 3) Foundation EIN (if present in raw)
  const ein = payload.raw?.foundationEIN ?? null;
  if (ein) {
    const byEin = await prisma.grant.findFirst({
      where: {
        foundationName: payload.foundation.foundationName ?? undefined,
      },
    });
    if (byEin) return byEin;
  }

  // 4) No match → treat as new
  return null;
}
