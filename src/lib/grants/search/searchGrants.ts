import { prisma } from "@/lib/prisma";
import { buildFilters } from "./buildFilters";
import { enforceTierAccess } from "./enforceTierAccess";

export async function searchGrants({
  query,
  filters,
  workspaceId,
  tier,
}: {
  query: string;
  filters: any;
  workspaceId?: string;
  tier: string;
}) {
  // ⭐ Step 1: Build Prisma filters
  const prismaFilters = buildFilters(filters);

  // ⭐ Step 2: Keyword search
  const keywordResults = await prisma.grant.findMany({
    where: {
      AND: [
        prismaFilters,
        {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { summary: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { agency: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
          ],
        },
      ],
    },
    take: 200,
  });

  // ⭐ Step 3: Tier enforcement
  const tierFiltered = enforceTierAccess(keywordResults, tier);

  // ⭐ Step 4: Workspace scoping (optional)
  const workspaceScoped = workspaceId
    ? tierFiltered.filter((g) => g.workspaceId === workspaceId || !g.workspaceId)
    : tierFiltered;

  return {
    count: workspaceScoped.length,
    results: workspaceScoped,
  };
}
