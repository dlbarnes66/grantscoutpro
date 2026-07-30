// lib/billing/check-usage.ts

import { prisma } from "@/lib/prisma";
import { USAGE_LIMITS } from "./usage-limits";

type UsageType = "searches" | "uploads" | "ai" | "members";
type Plan = "free" | "trial" | "paid";

export async function checkUsage(
  workspaceId: string,
  type: UsageType
) {
  const billing = await prisma.workspaceBilling.findUnique({
    where: { workspaceId },
  });

  if (!billing) throw new Error("Billing not initialized");

  const plan = billing.plan as Plan;

  const field = (`usage${capitalize(type)}` as
    | "usageSearches"
    | "usageUploads"
    | "usageAI"
    | "usageMembers");

  const current = billing[field];
  const limit = USAGE_LIMITS[plan][type];

  const allowed = current < limit;

  return {
    allowed,
    limit,
    current,
    plan,
  };
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
