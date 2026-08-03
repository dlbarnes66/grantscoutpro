// lib/grants/facets/buildFacetResponse.ts

import { Grant } from "@prisma/client";

export function buildFacetResponse(grants: Grant[]) {
  const categories = new Set<string>();
  const agencies = new Set<string>();
  const states = new Set<string>();
  const foundations = new Set<string>();
  const philanthropic = new Set<string>();

  let minAmount = Infinity;
  let maxAmount = 0;

  let earliestDeadline: Date | null = null;
  let latestDeadline: Date | null = null;

  for (const g of grants) {
    if (g.category) categories.add(g.category);
    if (g.agency) agencies.add(g.agency);
    if (g.eligibleStates) states.add(g.eligibleStates);
    if (g.foundationName) foundations.add(g.foundationName);
    if (g.philanthropicType) philanthropic.add(g.philanthropicType);

    if (g.amountMin !== null && g.amountMin < minAmount) {
      minAmount = g.amountMin;
    }

    if (g.amountMax !== null && g.amountMax > maxAmount) {
      maxAmount = g.amountMax;
    }

    if (g.deadline) {
      if (!earliestDeadline || g.deadline < earliestDeadline) {
        earliestDeadline = g.deadline;
      }
      if (!latestDeadline || g.deadline > latestDeadline) {
        latestDeadline = g.deadline;
      }
    }
  }

  return {
    categories: Array.from(categories),
    agencies: Array.from(agencies),
    states: Array.from(states),
    foundations: Array.from(foundations),
    philanthropic: Array.from(philanthropic),

    amountRange: {
      min: minAmount === Infinity ? null : minAmount,
      max: maxAmount === 0 ? null : maxAmount,
    },

    deadlines: {
      earliest: earliestDeadline,
      latest: latestDeadline,
    },
  };
}
