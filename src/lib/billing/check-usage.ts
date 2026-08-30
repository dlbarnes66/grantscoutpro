// src/lib/billing/check-usage.ts

import { prisma } from "@/lib/db";
import { getPlan } from "./getPlan";

export async function checkUsage(workspaceId: string) {
  const plan = await getPlan(workspaceId);

  const billing = await prisma.workspaceBilling.findUnique({
    where: { workspaceId },
    select: {
      usageSearches: true,
      usageUploads: true,
      usageMembers: true,
      usageAI: true,
    },
  });

  if (!billing) {
    return {
      allowed: true,
      reason: "no_billing_record",
    };
  }

  const limits = {
    free: { searches: 50, uploads: 10, members: 1, ai: 5000 },
    basic: { searches: 500, uploads: 100, members: 3, ai: 50000 },
    team: { searches: 2000, uploads: 500, members: 10, ai: 200000 },
    pro: { searches: 10000, uploads: 2000, members: 25, ai: 1000000 },
    enterprise: { searches: Infinity, uploads: Infinity, members: Infinity, ai: Infinity },
  };

  const tier = plan.plan ?? "free";
  const limit = limits[tier] ?? limits["free"];

  if (billing.usageSearches > limit.searches)
    return { allowed: false, reason: "search_limit_exceeded" };

  if (billing.usageUploads > limit.uploads)
    return { allowed: false, reason: "upload_limit_exceeded" };

  if (billing.usageMembers > limit.members)
    return { allowed: false, reason: "member_limit_exceeded" };

  if (billing.usageAI > limit.ai)
    return { allowed: false, reason: "ai_limit_exceeded" };

  return { allowed: true };
}
