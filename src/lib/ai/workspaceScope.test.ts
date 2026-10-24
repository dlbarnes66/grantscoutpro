import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ value: null as string | null, throws: false }));

vi.mock("next/headers", () => ({
  headers: async () => {
    if (state.throws) throw new Error("called outside a request scope");
    return { get: (name: string) => (name === "x-gsp-workspace-id" ? state.value : null) };
  },
}));

import { getScopedWorkspaceId } from "@/lib/ai/workspaceScope";

describe("getScopedWorkspaceId", () => {
  beforeEach(() => {
    state.value = null;
    state.throws = false;
  });

  it("returns the workspace id the proxy forwarded", async () => {
    state.value = "ws_123";
    expect(await getScopedWorkspaceId()).toBe("ws_123");
  });

  it("returns undefined when the header is missing or blank", async () => {
    expect(await getScopedWorkspaceId()).toBeUndefined();
    state.value = "   ";
    expect(await getScopedWorkspaceId()).toBeUndefined();
  });

  it("returns undefined outside a request (cron jobs, scripts)", async () => {
    state.throws = true;
    expect(await getScopedWorkspaceId()).toBeUndefined();
  });
});
