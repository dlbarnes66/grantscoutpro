// lib/billing/usage-limits.ts

export const USAGE_LIMITS = {
  free: {
    searches: 50,
    uploads: 5,
    ai: 20,
    members: 3,
  },
  trial: {
    searches: 200,
    uploads: 20,
    ai: 100,
    members: 10,
  },
  paid: {
    searches: Infinity,
    uploads: Infinity,
    ai: Infinity,
    members: Infinity,
  },
};
