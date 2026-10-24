import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  user: { id: "u1", name: "Pat", Org: null as any },
  created: null as any,
  workspaces: 0,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: async () => db.user,
      update: async () => ({}),
    },
    workspace: { count: async () => db.workspaces },
    org: {
      create: async ({ data }: any) => {
        db.created = data;
        return { id: "org1", ...data };
      },
    },
  },
}));

import { ensureUserOrg } from "@/lib/workspace/orgAccess";

describe("ensureUserOrg", () => {
  beforeEach(() => {
    db.user = { id: "u1", name: "Pat", Org: null };
    db.created = null;
    db.workspaces = 0;
  });

  it("starts a new account on a 14-day Business trial", async () => {
    const before = Date.now();
    await ensureUserOrg("u1");
    expect(db.created.tier).toBe("basic");
    expect(db.created.pilotTier).toBe("business");
    expect(db.created.billingStatus).toBe("trial");
    const days = (db.created.pilotEndsAt.getTime() - db.created.pilotStart.getTime()) / (24 * 3600 * 1000);
    expect(days).toBeCloseTo(14, 5);
    expect(db.created.pilotStart.getTime()).toBeGreaterThanOrEqual(before);
  });

  it("does not auto-trial an existing workspace owner who has no Org yet", async () => {
    db.workspaces = 2;
    await ensureUserOrg("u1");
    expect(db.created.pilotTier).toBeUndefined();
    expect(db.created.billingStatus).toBeUndefined();
  });

  it("does not touch an account that already exists", async () => {
    db.user.Org = { id: "existing", tier: "team" };
    const org = await ensureUserOrg("u1");
    expect(org.id).toBe("existing");
    expect(db.created).toBeNull();
  });
});
