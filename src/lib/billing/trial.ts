// src/lib/billing/trial.ts
//
// The free-trial lifecycle, in one pure module so the proxy, the billing
// APIs, the banner and the reminder job all agree.
//
//   day 1-14   full Business access (the trial is a pilot on the Org, so the
//              effective-plan logic in lib/plans.ts already applies it)
//   last 5 days a one-time 10% discount is offered on any plan
//   day 15+    an account that has not subscribed is LOCKED: it can only
//              reach the billing page and the locked page until it subscribes
//
// A trial is recognised by Org.billingStatus === "trial". The Stripe webhook
// overwrites billingStatus when someone subscribes, which ends the trial
// lifecycle (no discount, no lock) without any extra bookkeeping. Comped
// pilots granted by a superadmin never have that status, so they are never
// locked by this.

export const TRIAL_DISCOUNT_PERCENT = 10;
export const TRIAL_DISCOUNT_WINDOW_DAYS = 5;

const DAY_MS = 24 * 60 * 60 * 1000;

export type TrialOrg = {
  billingStatus?: string | null;
  stripeSubscriptionId?: string | null;
  pilotEndsAt?: Date | string | null;
};

export type TrialState = {
  isTrial: boolean;
  /** The trial period has not ended yet. */
  active: boolean;
  daysRemaining: number | null;
  subscribed: boolean;
  /** Inside the last TRIAL_DISCOUNT_WINDOW_DAYS days of an unsubscribed trial. */
  discountWindowOpen: boolean;
  /** Trial over and no subscription: the account is locked. */
  locked: boolean;
  endsAt: Date | null;
};

export function getTrialState(org: TrialOrg | null | undefined, now: Date = new Date()): TrialState {
  const isTrial = org?.billingStatus === "trial";
  const endsAt = org?.pilotEndsAt ? new Date(org.pilotEndsAt) : null;
  const validEnd = endsAt !== null && !Number.isNaN(endsAt.getTime());
  const subscribed = !!org?.stripeSubscriptionId;

  if (!isTrial || !validEnd) {
    return { isTrial: false, active: false, daysRemaining: null, subscribed, discountWindowOpen: false, locked: false, endsAt: null };
  }

  const msLeft = endsAt!.getTime() - now.getTime();
  const active = msLeft > 0;
  const daysRemaining = active ? Math.ceil(msLeft / DAY_MS) : 0;

  return {
    isTrial: true,
    active,
    daysRemaining,
    subscribed,
    discountWindowOpen: active && !subscribed && msLeft <= TRIAL_DISCOUNT_WINDOW_DAYS * DAY_MS,
    locked: !active && !subscribed,
    endsAt: endsAt!,
  };
}

export function isAccountLocked(org: TrialOrg | null | undefined, now: Date = new Date()): boolean {
  return getTrialState(org, now).locked;
}

/**
 * The Stripe coupon (10% off) for the trial offer. Created once in the Stripe
 * dashboard and referenced by id. When it is not configured the offer is
 * simply not shown, so the app never promises a discount it cannot apply.
 */
export function trialCouponId(): string | undefined {
  const id = process.env.STRIPE_TRIAL_COUPON_ID?.trim();
  return id ? id : undefined;
}

export function trialDiscountAvailable(state: TrialState): boolean {
  return state.discountWindowOpen && !!trialCouponId();
}

// Where a locked account can still go: choosing a plan, the locked screen,
// and what those two need. Everything else is blocked until they subscribe.
const LOCK_ALLOWED: RegExp[] = [
  /^\/locked(\/|$)/,
  /^\/billing(\/|$)/,
  /^\/workspace\/[^/]+\/locked(\/|$)/,
  /^\/workspace\/[^/]+\/workspace-billing(\/|$)/,
  /^\/api\/org\//,
  /^\/api\/workspaces\/[^/]+\/billing(\/|$)/,
  /^\/api\/workspaces\/[^/]+\/trial(\/|$)/,
  /^\/api\/webhooks\//,
  /^\/api\/health$/,
  /^\/api\/internal\//,
  /^\/api\/pilot$/,
  /^\/sign-in/,
  /^\/sign-up/,
];

export function isPathAllowedWhenLocked(pathname: string): boolean {
  return LOCK_ALLOWED.some((re) => re.test(pathname));
}
