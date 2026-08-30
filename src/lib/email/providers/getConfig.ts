// src/lib/email/providers/getConfig.ts

import { prisma } from "@/lib/db";

export async function getEmailProviderConfig(params: {
  orgId?: string | null;
  type: "transactional" | "marketing" | "enterprise";
}) {
  const { orgId, type } = params;

  if (orgId) {
    const orgConfig = await prisma.emailProviderConfig.findFirst({
      where: { orgId, type },
    });

    if (orgConfig) return orgConfig;
  }

  const globalConfig = await prisma.emailProviderConfig.findFirst({
    where: { orgId: null, type },
  });

  if (!globalConfig)
    throw new Error(`Missing global email provider config for ${type}`);

  return globalConfig;
}
