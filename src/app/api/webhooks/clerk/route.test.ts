import { beforeEach, describe, expect, it, vi } from "vitest";
import { Webhook } from "svix";

const sync = vi.hoisted(() => vi.fn(async () => ({})));

vi.mock("@/lib/prisma", () => ({
  prisma: { workspaceInvite: { findMany: async () => [], update: async () => ({}) }, workspaceMember: { upsert: async () => ({}) } },
}));
vi.mock("@/lib/userSync", () => ({ syncUserFromClerk: sync }));
vi.mock("@/lib/email/sendgrid", () => ({ sendEmailSafe: async () => ({ ok: true }) }));
vi.mock("@/lib/email/templates", () => ({ welcomeEmail: () => ({ subject: "s", html: "h", text: "t" }) }));

import { POST } from "./route";

const SECRET = "whsec_" + Buffer.from("test-secret-for-unit-tests-123456").toString("base64");

function signed(body: object, secret = SECRET) {
  const raw = JSON.stringify(body);
  const ts = new Date();
  const id = "msg_test";
  const signature = new Webhook(secret).sign(id, ts, raw);
  return new Request("http://localhost/api/webhooks/clerk", {
    method: "POST",
    body: raw,
    headers: { "svix-id": id, "svix-timestamp": String(Math.floor(ts.getTime() / 1000)), "svix-signature": signature },
  }) as any;
}

describe("Clerk webhook", () => {
  beforeEach(() => {
    process.env.CLERK_WEBHOOK_SECRET = SECRET;
    sync.mockClear();
  });

  it("accepts a correctly signed user.created event and syncs the user", async () => {
    const res = await POST(signed({ type: "user.created", data: { id: "user_1", first_name: "A", email_addresses: [] } }));
    expect(res.status).toBe(200);
    expect(sync).toHaveBeenCalledOnce();
  });

  it("rejects a bad signature with 400 and does nothing", async () => {
    const other = "whsec_" + Buffer.from("a-different-secret-1234567890abcd").toString("base64");
    const res = await POST(signed({ type: "user.created", data: { id: "user_1" } }, other));
    expect(res.status).toBe(400);
    expect(sync).not.toHaveBeenCalled();
  });
});
