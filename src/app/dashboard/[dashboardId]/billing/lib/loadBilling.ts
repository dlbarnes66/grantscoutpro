import { prisma } from "@/lib/prisma";

export async function loadBilling(workspaceId: string) {
  const billing = await prisma.workspaceBilling.findUnique({
    where: { workspaceId },
  });

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      subscriptionTier: true,
      billingStatus: true,
      billingPeriod: true,
      billingRenewalDate: true,
      stripeCustomerId: true,
    },
  });

  return { billing, workspace };
}
