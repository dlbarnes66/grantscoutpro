import { afterEach, describe, expect, it } from "vitest";
import {
  getTrialState,
  isAccountLocked,
  isPathAllowedWhenLocked,
  trialDiscountAvailable,
  trialCouponId,
} from "@/lib/billing/trial";

const DAY = 24 * 3600 * 1000;
const NOW = new Date("2026-11-01T12:00:00Z");
const org = (daysLeft: number, extra: Record<string, unknown> = {}) => ({
  billingStatus: "trial",
  stripeSubscriptionId: null,
  pilotEndsAt: new Date(NOW.getTime() + daysLeft * DAY),
  ...extra,
});

describe("getTrialState", () => {
  it("is quiet early in the trial", () => {
    const s = getTrialState(org(10), NOW);
    expect(s).toMatchObject({ isTrial: true, active: true, discountWindowOpen: false, locked: false, daysRemaining: 10 });
  });

  it("opens the discount window for the last 5 days only", () => {
    expect(getTrialState(org(5.5), NOW).discountWindowOpen).toBe(false);
    expect(getTrialState(org(5), NOW).discountWindowOpen).toBe(true);
    expect(getTrialState(org(1), NOW).discountWindowOpen).toBe(true);
  });

  it("locks an unsubscribed account once the trial ends", () => {
    expect(isAccountLocked(org(-0.01), NOW)).toBe(true);
    expect(isAccountLocked(org(0.01), NOW)).toBe(false);
    expect(getTrialState(org(-1), NOW).discountWindowOpen).toBe(false);
  });

  it("never locks or discounts a subscriber", () => {
    const s = getTrialState(org(-3, { stripeSubscriptionId: "sub_1" }), NOW);
    expect(s.locked).toBe(false);
    expect(getTrialState(org(2, { stripeSubscriptionId: "sub_1" }), NOW).discountWindowOpen).toBe(false);
  });

  it("never locks a comped pilot or an account with no trial", () => {
    expect(isAccountLocked(org(-30, { billingStatus: "active" }), NOW)).toBe(false);
    expect(isAccountLocked(org(-30, { billingStatus: null }), NOW)).toBe(false);
    expect(isAccountLocked(null, NOW)).toBe(false);
    expect(isAccountLocked({ billingStatus: "trial", pilotEndsAt: null }, NOW)).toBe(false);
  });
});

describe("discount coupon", () => {
  const prev = process.env.STRIPE_TRIAL_COUPON_ID;
  afterEach(() => {
    if (prev === undefined) delete process.env.STRIPE_TRIAL_COUPON_ID;
    else process.env.STRIPE_TRIAL_COUPON_ID = prev;
  });

  it("is only offered when a coupon is configured", () => {
    const s = getTrialState(org(3), NOW);
    delete process.env.STRIPE_TRIAL_COUPON_ID;
    expect(trialDiscountAvailable(s)).toBe(false);
    process.env.STRIPE_TRIAL_COUPON_ID = " coupon_10 ";
    expect(trialCouponId()).toBe("coupon_10");
    expect(trialDiscountAvailable(s)).toBe(true);
    expect(trialDiscountAvailable(getTrialState(org(10), NOW))).toBe(false);
  });
});

describe("isPathAllowedWhenLocked", () => {
  it("lets a locked account reach billing and nothing else", () => {
    for (const p of ["/billing", "/locked", "/api/org/billing", "/api/org/billing/checkout", "/api/webhooks/stripe", "/workspace/w1/workspace-billing"]) {
      expect(isPathAllowedWhenLocked(p), p).toBe(true);
    }
    for (const p of ["/dashboard", "/workspace/w1", "/api/workspaces/w1/grants", "/api/ai/anything", "/billing-evil/x".replace("/billing-evil", "/api/organizations")]) {
      expect(isPathAllowedWhenLocked(p), p).toBe(false);
    }
  });
});
