// lib/grants/federal/syncFederalGrants.ts

import { fetchFederalGrants } from "./fetchFederalGrants";
import { normalizeFederalGrant } from "./normalizeFederalGrant";
import { prisma } from "@/lib/prisma";

export async function syncFederalGrants() {
  const raw = await fetchFederalGrants();
  const normalized = raw.map((g) => normalizeFederalGrant(g));

  for (const grant of normalized) {
    await prisma.grant.upsert({
      where: {
        id: grant.id,
      },
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
        totalFunding: grant.totalFunding,
        eligibility: grant.eligibility,
        eligibleApplicants: grant.eligibleApplicants,
        ineligibleApplicants: grant.ineligibleApplicants,
        geographicFocus: grant.geographicFocus,
        eligibleStates: grant.eligibleStates,
        url: grant.url,
        source: grant.source,
        tierAccess: grant.tierAccess,
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
        totalFunding: grant.totalFunding,
        eligibility: grant.eligibility,
        eligibleApplicants: grant.eligibleApplicants,
        ineligibleApplicants: grant.ineligibleApplicants,
        geographicFocus: grant.geographicFocus,
        eligibleStates: grant.eligibleStates,
        url: grant.url,
        source: grant.source,
        tierAccess: grant.tierAccess,
      },
    });
  }

  return normalized.length;
}
