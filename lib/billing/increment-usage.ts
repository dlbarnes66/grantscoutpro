// lib/billing/increment-usage.ts

import { prisma } from "@/lib/prisma";

export async function incrementUsage(
  workspaceId: string,
  type: "searches" | "uploads" | "ai" | "members"
) {
  const field = `usage${capitalize(type)}`;

  return prisma.workspaceBilling.update({
    where: { workspaceId },
    data: {
      [field]: { increment: 1 },
    },
  });
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
