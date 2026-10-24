import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { isAuthorizedCronRequest, safeEqual } from "@/lib/security/cronAuth";

const req = (headers: Record<string, string>) => new NextRequest("https://example.test/api/internal/grants/scan", { headers });

describe("cron auth", () => {
  it("safeEqual compares exact strings only", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
    expect(safeEqual(null, "abc")).toBe(false);
    expect(safeEqual(undefined, undefined)).toBe(false);
  });

  it("accepts the x-cron-secret header", () => {
    expect(isAuthorizedCronRequest(req({ "x-cron-secret": "s3cret" }), "s3cret")).toBe(true);
  });

  it("accepts Vercel's Authorization: Bearer format", () => {
    expect(isAuthorizedCronRequest(req({ authorization: "Bearer s3cret" }), "s3cret")).toBe(true);
  });

  it("rejects missing or wrong secrets", () => {
    expect(isAuthorizedCronRequest(req({}), "s3cret")).toBe(false);
    expect(isAuthorizedCronRequest(req({ "x-cron-secret": "nope" }), "s3cret")).toBe(false);
    expect(isAuthorizedCronRequest(req({ authorization: "Bearer nope" }), "s3cret")).toBe(false);
    expect(isAuthorizedCronRequest(req({ authorization: "s3cret" }), "s3cret")).toBe(false);
  });
});
