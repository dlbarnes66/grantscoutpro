import { describe, expect, it } from "vitest";
import { normalizeWebsiteUrl, sanitizeProfilePatch } from "@/lib/profile/profilePatch";

describe("normalizeWebsiteUrl", () => {
  it("adds https and strips a trailing slash", () => {
    expect(normalizeWebsiteUrl("example.org/")).toBe("https://example.org");
  });
  it("rejects text that is not a web address", () => {
    expect(normalizeWebsiteUrl("")).toBeNull();
    expect(normalizeWebsiteUrl("not a url")).toBeNull();
    expect(normalizeWebsiteUrl("localhost")).toBeNull();
    expect(normalizeWebsiteUrl("ftp://example.org")).toBeNull();
  });
});

describe("sanitizeProfilePatch", () => {
  it("rejects a body that is not an object", () => {
    expect(sanitizeProfilePatch(null)).toHaveProperty("error");
    expect(sanitizeProfilePatch("x")).toHaveProperty("error");
  });

  it("formats a valid EIN and UEI", () => {
    const r = sanitizeProfilePatch({ ein: "123456789", uei: "abcd efgh jk12" }) as any;
    expect(r.data.ein).toBe("12-3456789");
    expect(r.data.uei).toBe("ABCDEFGHJK12");
  });

  it("rejects a bad EIN, UEI, ZIP and email", () => {
    expect(sanitizeProfilePatch({ ein: "12-345" })).toHaveProperty("error");
    expect(sanitizeProfilePatch({ uei: "SHORT" })).toHaveProperty("error");
    expect(sanitizeProfilePatch({ zipCode: "1234" })).toHaveProperty("error");
    expect(sanitizeProfilePatch({ authorizedRepEmail: "nope" })).toHaveProperty("error");
  });

  it("accepts ZIP+4 and a normal email", () => {
    const r = sanitizeProfilePatch({ zipCode: "36601-1234", authorizedRepEmail: "a@b.org" }) as any;
    expect(r.data.zipCode).toBe("36601-1234");
    expect(r.data.authorizedRepEmail).toBe("a@b.org");
  });

  it("drops fields it does not know about", () => {
    const r = sanitizeProfilePatch({ ein: "123456789", isAdmin: true, subscriptionTier: "enterprise" }) as any;
    expect(r.data).not.toHaveProperty("isAdmin");
    expect(r.data).not.toHaveProperty("subscriptionTier");
  });

  it("only accepts organizationType when the caller allows it", () => {
    const blocked = sanitizeProfilePatch({ organizationType: "Nonprofit" }) as any;
    expect(blocked.data).not.toHaveProperty("organizationType");
    const allowed = sanitizeProfilePatch({ organizationType: "Nonprofit" }, { allowOrganizationType: true }) as any;
    expect(allowed.data.organizationType).toBe("Nonprofit");
  });
});
