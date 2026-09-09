export type PlanId = "basic" | "team" | "business" | "enterprise";

export interface PlanAccess {
  federal: boolean;
  state: boolean;
  foundation: boolean;
  crm: boolean;
}

export interface PlanConfig {
  id: PlanId;
  name: string;
  monthlyPrice: number | null; // null = custom pricing (Enterprise)
  maxSeats: number | null; // null = unlimited seats
  manualSearchesPerDay: number | null; // null = unlimited manual searches/day
  access: PlanAccess;
}

// Single source of truth for plan tiers: seat limits, manual-search
// allowance, and grant-database access. Used by the marketing pricing
// page (display) and the workspace invite/member/search APIs
// (enforcement), so display and enforcement can never drift apart.
export const PLANS: Record<PlanId, PlanConfig> = {
  basic: {
    id: "basic",
    name: "Basic",
    monthlyPrice: 29,
    maxSeats: 1,
    manualSearchesPerDay: 1,
    access: { federal: true, state: false, foundation: false, crm: false },
  },
  team: {
    id: "team",
    name: "Team",
    monthlyPrice: 49,
    maxSeats: 5,
    manualSearchesPerDay: 5,
    access: { federal: true, state: true, foundation: false, crm: false },
  },
  business: {
    id: "business",
    name: "Business",
    monthlyPrice: 99,
    maxSeats: 10,
    manualSearchesPerDay: 15,
    access: { federal: true, state: true, foundation: true, crm: false },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: null,
    maxSeats: null,
    manualSearchesPerDay: null,
    access: { federal: true, state: true, foundation: true, crm: true },
  },
};

// Shared "Save X% billed annually" pitch, used by both the marketing
// pricing toggle (src/app/(marketing)/page.tsx) and the in-app workspace
// billing page (src/app/(workspace-group)/workspace/[workspaceId]/workspace-billing/page.tsx)
// so the discount they advertise can't drift apart.
export const ANNUAL_DISCOUNT_PERCENT = 15;

export function getAnnualMonthlyEquivalent(monthlyPrice: number): number {
  return Math.round(monthlyPrice * (1 - ANNUAL_DISCOUNT_PERCENT / 100));
}

const DEFAULT_PLAN: PlanId = "basic";

export function getPlan(planId?: string | null): PlanConfig {
  if (planId && planId in PLANS) {
    return PLANS[planId as PlanId];
  }
  return PLANS[DEFAULT_PLAN];
}

export function getSeatLimitLabel(plan: PlanConfig): string {
  if (plan.maxSeats === null) return "Unlimited users";
  return `Up to ${plan.maxSeats} user${plan.maxSeats === 1 ? "" : "s"}`;
}

export function isAtSeatLimit(plan: PlanConfig, seatsInUse: number): boolean {
  if (plan.maxSeats === null) return false;
  return seatsInUse >= plan.maxSeats;
}

export function getManualSearchLimitLabel(plan: PlanConfig): string {
  if (plan.manualSearchesPerDay === null) return "Unlimited manual searches";
  return `${plan.manualSearchesPerDay} manual search${plan.manualSearchesPerDay === 1 ? "" : "es"}/day`;
}

const DAY_MS = 24 * 60 * 60 * 1000;

// Given the last reset timestamp, tells the caller whether the daily
// counter is due to roll over. Pure function so it's easy to test.
export function isManualSearchResetDue(resetAt: Date, now: Date = new Date()): boolean {
  return now.getTime() - resetAt.getTime() >= DAY_MS;
}
