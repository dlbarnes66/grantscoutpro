import { prisma } from "@/lib/prisma";

export async function searchGrants(workspaceId: string, query: string) {
  const grants = await prisma.grant.findMany({
    where: {
      workspaceId,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { summary: { contains: query, mode: "insensitive" } },
        { category: { contains: query, mode: "insensitive" } },
        { agency: { contains: query, mode: "insensitive" } },
        { foundationName: { contains: query, mode: "insensitive" } },
        { philanthropicType: { contains: query, mode: "insensitive" } },
        { tags: { has: query } },
      ],
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 50,
  });

  return grants;
}
