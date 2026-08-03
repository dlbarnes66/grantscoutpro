import { prisma } from "@/lib/prisma";
import { USAGE_LIMITS } from "./usage-limits";

type UsageType = "searches" | "uploads" | "ai" | "members";
type Plan = "free" | "trial" | "paid";

export async function checkUsage(workspaceId: string, type: UsageType) {
  const billing = await prisma.workspaceBilling.findUnique({
    where: { workspaceId },
  });

  if (!billing) throw new Error("Billing not initialized");

  const plan = (billing.plan as Plan) ?? "free";

  const fieldMap = {
    searches: "usageSearches",
    uploads: "usageUploads",
    ai: "usageAI",
    members: "usageMembers",
  } as const;

  const field = fieldMap[type];
  const current = billing[field] ?? 0;
  const limit = USAGE_LIMITS[plan][type];

  return {
    allowed: current < limit,
    limit,
    current,
    plan,
  };
}
