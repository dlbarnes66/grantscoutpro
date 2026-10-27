import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

// Shared-secret check for the server-to-server routes the Nonprofit Management
// app calls (/api/internal/nonprofit-os/*). null = not configured here.
export function nonprofitOsAuthorized(req: NextRequest): boolean | null {
  const secret = process.env.NONPROFIT_OS_SHARED_SECRET;
  if (!secret || secret.length < 32) return null;
  const header = req.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const SAFE_ID = /^[A-Za-z0-9_-]{1,64}$/;
