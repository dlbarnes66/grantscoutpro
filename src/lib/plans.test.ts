import { describe, expect, it } from "vitest";
import {
  PLANS,
  getPlan,
  resolveEffectivePlanId,
  isAtSeatLimit,
  isAtWorkspaceLimit,
  isManualSearchResetDue,
  getAnnualMonthlyEquivalent,
} from "@/lib/plans";

describe("plans", () => {
  it("lists the four tiers with the published prices", () => {
    expect(PLANS.basic.monthlyPrice).toBe(29);
    expect(PLANS.team.monthlyPrice).toBe(49);
    expect(PLANS.business.monthlyPrice).toBe(99);
    expect(PLANS.enterprise.monthlyPrice).toBeNull();
  });

  it("matches the manual search allowances shown on the pricing page", () => {
    expect([PLANS.basic, PLANS.team, PLANS.business].map((p) => p.manualSearchesPerDay)).toEqual([1, 5, 15]);
  });

  it("gives every plan a finite monthly AI allowance that grows with the tier", () => {
    const ai = [PLANS.basic, PLANS.team, PLANS.business, PLANS.enterprise].map((p) => p.aiTokensMonthly);
    ai.forEach((n) => expect(Number.isFinite(n)).toBe(true));
    expect([...ai].sort((a, b) => a - b)).toEqual(ai);
  });

  it("includes the AI Proposal Writer from Team up, as the pricing page says", () => {
    expect(PLANS.basic.aiProposalWriter).toBe(false);
    expect(PLANS.team.aiProposalWriter).toBe(true);
    expect(PLANS.business.aiProposalWriter).toBe(true);
    expect(PLANS.enterprise.aiProposalWriter).toBe(true);
  });

  it("falls back to Basic for unknown or legacy plan ids", () => {
    expect(getPlan("starter").id).toBe("basic");
    expect(getPlan("free").id).toBe("basic");
    expect(getPlan(null).id).toBe("basic");
    expect(getPlan("team").id).toBe("team");
  });

  it("prefers an active pilot tier, then the org tier, then the billing plan", () => {
    const future = new Date(Date.now() + 5 * 24 * 3600 * 1000);
    const past = new Date(Date.now() - 24 * 3600 * 1000);
    expect(resolveEffectivePlanId({ org: { tier: "basic", pilotTier: "business", pilotEndsAt: future } })).toBe("business");
    expect(resolveEffectivePlanId({ org: { tier: "team", pilotTier: "business", pilotEndsAt: past } })).toBe("team");
    expect(resolveEffectivePlanId({ org: null, billing: { plan: "business" } })).toBe("business");
    expect(resolveEffectivePlanId({ org: null, billing: { plan: "free" } })).toBe("basic");
  });

  it("enforces seat and workspace limits", () => {
    expect(isAtSeatLimit(PLANS.basic, 1)).toBe(true);
    expect(isAtSeatLimit(PLANS.team, 4)).toBe(false);
    expect(isAtSeatLimit(PLANS.enterprise, 5000)).toBe(false);
    expect(isAtWorkspaceLimit(PLANS.basic, 1)).toBe(true);
    expect(isAtWorkspaceLimit(PLANS.business, 5)).toBe(false);
  });

  it("rolls the daily search counter after 24 hours", () => {
    const now = new Date("2026-10-24T12:00:00Z");
    expect(isManualSearchResetDue(new Date("2026-10-23T12:00:01Z"), now)).toBe(false);
    expect(isManualSearchResetDue(new Date("2026-10-23T12:00:00Z"), now)).toBe(true);
  });

  it("computes the annual monthly equivalent with the 15% discount", () => {
    expect(getAnnualMonthlyEquivalent(100)).toBe(85);
  });
});
