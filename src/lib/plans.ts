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
  access: PlanAccess;
}

// Single source of truth for plan tiers: seat limits and grant-database
// access. Used both by the marketing pricing page (display) and by the
// workspace invite/member APIs (enforcement), so the two can never drift
// apart the way the old hardcoded copy did.
export const PLANS: Record<PlanId, PlanConfig> = {
  basic: {
    id: "basic",
    name: "Basic",
    monthlyPrice: 29,
    maxSeats: 1,
    access: { federal: true, state: false, foundation: false, crm: false },
  },
  team: {
    id: "team",
    name: "Team",
    monthlyPrice: 49,
    maxSeats: 5,
    access: { federal: true, state: true, foundation: false, crm: false },
  },
  business: {
    id: "business",
    name: "Business",
    monthlyPrice: 99,
    maxSeats: 10,
    access: { federal: true, state: true, foundation: true, crm: false },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: null,
    maxSeats: null,
    access: { federal: true, state: true, foundation: true, crm: true },
  },
};

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
