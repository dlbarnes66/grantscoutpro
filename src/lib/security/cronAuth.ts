// src/lib/security/cronAuth.ts
//
// Shared secret check for the scheduled (cron) endpoints. Compares in
// constant time so response timing cannot be used to guess the secret
// one character at a time.

import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export function safeEqual(a: string | null | undefined, b: string | null | undefined): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

// Accepts the secret as `x-cron-secret: <secret>` or the standard
// `Authorization: Bearer <secret>` header (what Vercel Cron sends).
export function isAuthorizedCronRequest(req: NextRequest, secret: string): boolean {
  if (safeEqual(req.headers.get("x-cron-secret"), secret)) return true;
  return safeEqual(req.headers.get("authorization"), `Bearer ${secret}`);
}
