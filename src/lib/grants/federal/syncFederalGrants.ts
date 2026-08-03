// lib/grants/federal/syncFederalGrants.ts

import { prisma } from "@/lib/prisma";
import { GrantTierAccess } from "@prisma/client";

export async function syncFederalGrants(workspaceId: string, federalGrants: any[]) {
  for (const grant of federalGrants) {
    await prisma.grant.upsert({
      where: { id: grant.id },
      update: {
        title: grant.title,
        summary: grant.summary,
        description: grant.description,
        agency: grant.agency,
        category: grant.category,
        deadline: grant.deadline,
        postedDate: grant.postedDate,
        updatedDate: grant.updatedDate,
        amountMin: grant.amountMin,
        amountMax: grant.amountMax,
        url: grant.url,
        source: grant.source,
        tierAccess: grant.tierAccess as GrantTierAccess,
      },
      create: {
        id: grant.id,
        title: grant.title,
        summary: grant.summary,
        description: grant.description,
        agency: grant.agency,
        category: grant.category,
        deadline: grant.deadline,
        postedDate: grant.postedDate,
        updatedDate: grant.updatedDate,
        amountMin: grant.amountMin,
        amountMax: grant.amountMax,
        url: grant.url,
        source: grant.source,
        tierAccess: grant.tierAccess as GrantTierAccess,

        // ⭐ REQUIRED by Prisma
        workspace: {
          connect: { id: workspaceId },
        },
      },
    });
  }
}
