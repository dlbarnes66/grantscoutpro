import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { logBillingEvent } from "./logBillingEvent";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
});

export async function syncWorkspaceBilling(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { billing: true },
  });

  if (!workspace) throw new Error("Workspace not found");

  let billing = workspace.billing;

  if (!billing) {
    billing = await prisma.workspaceBilling.create({
      data: {
        workspaceId,
        plan: "free",
        usageSearches: 0,
        usageUploads: 0,
        usageAI: 0,
        usageMembers: 1,
        periodStart: new Date(),
      },
    });
  }

  if (!billing.stripeSubscriptionId || !billing.stripeCustomerId) {
    await logBillingEvent(
      "sync_skipped",
      "Workspace has no Stripe subscription/customer",
      workspaceId
    );
    return;
  }

  const subscriptionResponse = await stripe.subscriptions.retrieve(
    billing.stripeSubscriptionId
  );
  const subscription = subscriptionResponse.data;

  const status = subscription.status;
  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : null;

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      billingStatus: status,
      billingRenewalDate: periodEnd,
    },
  });

  await prisma.workspaceBilling.update({
    where: { workspaceId },
    data: {
      stripeCustomerId: billing.stripeCustomerId,
      stripeSubscriptionId: billing.stripeSubscriptionId,
      periodEnd,
    },
  });

  await logBillingEvent(
    "sync_completed",
    `Billing sync completed with status '${status}'`,
    workspaceId
  );
}
