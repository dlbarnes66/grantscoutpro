// src/lib/billing/usage-limits.ts

export function getUsageLimits(plan: string) {
  switch (plan) {
    case "enterprise":
      return {
        searches: 5000,
        uploads: 2000,
        members: 200,
        ai: 10000,
      };

    case "team":
      return {
        searches: 2000,
        uploads: 500,
        members: 50,
        ai: 3000,
      };

    default:
      return {
        searches: 500,
        uploads: 100,
        members: 5,
        ai: 500,
      };
  }
}
