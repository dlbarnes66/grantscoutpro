import { describe, expect, it } from "vitest";
import { resolveAppUrl } from "@/lib/appUrl";

describe("resolveAppUrl", () => {
  it("uses a configured full URL and trims the slash", () => {
    expect(resolveAppUrl({ APP_URL: "https://www.grantscoutpro.com/" }, "x.com", "https")).toBe("https://www.grantscoutpro.com");
  });
  it("ignores a configured value with no scheme and uses the request host", () => {
    expect(resolveAppUrl({ NEXT_PUBLIC_APP_URL: "www.grantscoutpro.com" }, "www.grantscoutpro.com", "https")).toBe("https://www.grantscoutpro.com");
  });
  it("falls back to the request host, http for localhost", () => {
    expect(resolveAppUrl({}, "localhost:3000", null)).toBe("http://localhost:3000");
    expect(resolveAppUrl({}, "www.grantscoutpro.com", null)).toBe("https://www.grantscoutpro.com");
  });
  it("never returns an empty string", () => {
    expect(resolveAppUrl({}, null, null)).toBe("https://www.grantscoutpro.com");
  });
});
