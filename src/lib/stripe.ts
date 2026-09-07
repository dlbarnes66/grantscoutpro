// src/lib/stripe.ts

import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-07-29.dahlia",
});

export function verifyStripeSignature(rawBody: string, signature: string) {
  return stripe.webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}

export function normalizeSubscription(sub: any) {
  return {
    id: sub.id,
    customerId: sub.customer,
    status: sub.status,
    periodStart: new Date(sub.billing_cycle_anchor * 1000),
    periodEnd: sub.current_period_end
      ? new Date(sub.current_period_end * 1000)
      : null,
  };
}

export function normalizeInvoice(inv: any) {
  return {
    id: inv.id,
    customerId: inv.customer,
    subscriptionId: inv.subscription,
    amountPaid: inv.amount_paid,
    currency: inv.currency,
  };
}

// --- Plan <-> Stripe Price ID mapping ---------------------------------
//
// Self-serve checkout only covers Basic/Team/Business (Enterprise is
// custom-priced/sales-assisted - see PLANS.enterprise.monthlyPrice ===
// null in src/lib/plans.ts). Reads the price IDs you already have in
// .env; if one is missing, checkout for that plan/interval fails loudly
// instead of silently charging the wrong amount.

import type { PlanId } from "@/lib/plans";

export type BillingInterval = "monthly" | "yearly";

const PRICE_ENV_BY_PLAN: Record<string, Record<BillingInterval, string | undefined>> = {
  basic: {
    monthly: process.env.STRIPE_PRICE_BASIC_MONTHLY,
    yearly: process.env.STRIPE_PRICE_BASIC_YEARLY,
  },
  team: {
    monthly: process.env.STRIPE_PRICE_TEAM_MONTHLY,
    yearly: process.env.STRIPE_PRICE_TEAM_YEARLY,
  },
  business: {
    monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY,
    yearly: process.env.STRIPE_PRICE_BUSINESS_YEARLY,
  },
};

export function getPriceIdForPlan(planId: string, interval: BillingInterval): string {
  const priceId = PRICE_ENV_BY_PLAN[planId]?.[interval];
  if (!priceId) {
    throw new Error(
      `No Stripe price configured for plan "${planId}" (${interval}). Check your .env STRIPE_PRICE_* vars.`
    );
  }
  return priceId;
}

const PLAN_BY_PRICE_ID: Record<string, PlanId> = {};
for (const [planId, intervals] of Object.entries(PRICE_ENV_BY_PLAN)) {
  for (const priceId of Object.values(intervals)) {
    if (priceId) PLAN_BY_PRICE_ID[priceId] = planId as PlanId;
  }
}

export function getPlanIdFromPriceId(priceId: string | undefined | null): PlanId | null {
  if (!priceId) return null;
  return PLAN_BY_PRICE_ID[priceId] ?? null;
}


// --- Addon <-> Stripe Price ID mapping --------------------------------
//
// Addons are billed as their own separate Stripe subscription (not a line
// item added to the plan subscription), so the plan-sync logic in the
// webhook never needs to know about them. Right now only the CRM addon is
// wired up end to end; STATE/FOUNDATIONS price IDs exist in .env but
// aren't sold as standalone addons yet.

export type AddonType = "crm";

const ADDON_PRICE_ENV: Record<AddonType, Record<BillingInterval, string | undefined>> = {
  crm: {
    monthly: process.env.STRIPE_PRICE_ADDON_CRM_MONTHLY,
    yearly: process.env.STRIPE_PRICE_ADDON_CRM_YEARLY,
  },
};

export function getAddonPriceId(addonType: AddonType, interval: BillingInterval): string {
  const priceId = ADDON_PRICE_ENV[addonType]?.[interval];
  if (!priceId) {
    throw new Error(
      `No Stripe price configured for the "${addonType}" addon (${interval}). Check your .env STRIPE_PRICE_ADDON_* vars.`
    );
  }
  return priceId;
}

const ADDON_BY_PRICE_ID: Record<string, AddonType> = {};
for (const [addonType, intervals] of Object.entries(ADDON_PRICE_ENV)) {
  for (const priceId of Object.values(intervals)) {
    if (priceId) ADDON_BY_PRICE_ID[priceId] = addonType as AddonType;
  }
}

export function getAddonTypeFromPriceId(priceId: string | undefined | null): AddonType | null {
  if (!priceId) return null;
  return ADDON_BY_PRICE_ID[priceId] ?? null;
}
