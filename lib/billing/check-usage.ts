// lib/billing/check-usage.ts

import { prisma } from "@/lib/prisma";
import { USAGE_LIMITS } from "./usage-limits";

export async function checkUsage(
  workspaceId: string,
  type: "searches" | "uploads" | "ai" | "members"
) {
  const billing = await prisma.workspaceBilling.findUnique({
    where: { workspaceId },
  });

  if (!billing) throw new Error("Billing not initialized");

  const plan = billing.plan as "free" | "trial" | "paid";
  const limit = USAGE_LIMITS[plan][type];
  const current = billing[`usage${capitalize(type)}`];

  if (current >= limit) {
    return {
      allowed: false,
      limit,
      current,
      plan,
    };
  }

  return {
    allowed: true,
    limit,
    current,
    plan,
  };
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
