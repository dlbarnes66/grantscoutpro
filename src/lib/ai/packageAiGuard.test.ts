import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  budget: { allowed: true, limit: 75000, used: 1000, planId: "basic", nextResetAt: new Date("2026-11-20") } as any,
  recorded: [] as Array<[string, number]>,
  fail: false,
  scoped: undefined as string | undefined,
}));

vi.mock("@/lib/ai/aiUsage", () => ({
  checkAiTokenBudget: async () => {
    if (state.fail) throw new Error("db down");
    return state.budget;
  },
  recordAiTokenUsage: async (w: string, t: number) => {
    state.recorded.push([w, t]);
  },
}));

vi.mock("@/lib/ai/workspaceScope", () => ({ getScopedWorkspaceId: async () => state.scoped }));

import { guardPackageAI, runWithAiWorkspace, trackAiUsage } from "@/lib/ai/packageAiGuard";

describe("package AI guard", () => {
  beforeEach(() => {
    delete process.env.ENFORCE_AI_PROPOSAL_PLAN_GATE;
    state.budget = { allowed: true, limit: 75000, used: 1000, planId: "basic", nextResetAt: new Date("2026-11-20") };
    state.recorded = [];
    state.fail = false;
    state.scoped = undefined;
  });

  it("allows a Basic workspace while the plan gate is off", async () => {
    expect(await guardPackageAI("w1")).toBeNull();
  });

  it("blocks Basic with 403 when the plan gate is on, but allows Team", async () => {
    process.env.ENFORCE_AI_PROPOSAL_PLAN_GATE = "true";
    const blocked = await guardPackageAI("w1");
    expect(blocked?.status).toBe(403);
    state.budget = { ...state.budget, planId: "team" };
    expect(await guardPackageAI("w1")).toBeNull();
  });

  it("blocks with 429 once the monthly allowance is used up", async () => {
    state.budget = { ...state.budget, allowed: false, used: 75000 };
    const blocked = await guardPackageAI("w1");
    expect(blocked?.status).toBe(429);
    expect((await blocked!.json()).code).toBe("AI_ALLOWANCE_EXHAUSTED");
  });

  it("fails open if the budget lookup errors", async () => {
    state.fail = true;
    expect(await guardPackageAI("w1")).toBeNull();
  });

  it("records usage only for a workspace that is in scope", async () => {
    trackAiUsage({ usage: { total_tokens: 500 } });
    expect(state.recorded).toHaveLength(0);
    await runWithAiWorkspace("w9", async () => {
      await new Promise((r) => setTimeout(r, 5));
      trackAiUsage({ usage: { total_tokens: 1234 } });
    });
    expect(state.recorded).toEqual([["w9", 1234]]);
  });

  it("falls back to the workspace the proxy verified for the request", async () => {
    state.scoped = "w_from_proxy";
    trackAiUsage({ usage: { total_tokens: 777 } });
    await new Promise((r) => setTimeout(r, 5));
    expect(state.recorded).toEqual([["w_from_proxy", 777]]);
  });

  it("ignores responses with no token count", async () => {
    state.scoped = "w1";
    trackAiUsage({ usage: null });
    trackAiUsage({});
    await new Promise((r) => setTimeout(r, 5));
    expect(state.recorded).toHaveLength(0);
  });
});
