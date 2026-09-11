import { NextRequest, NextResponse } from "next/server";
import { checkDeadlines } from "@/lib/notifications/checkDeadlines";

// See the identical helper in ../../grants/scan/route.ts - accepts either
// a plain x-cron-secret header (external scheduler) or Vercel's native
// Cron Jobs format (Authorization: Bearer <CRON_SECRET>, which Vercel
// controls and can't be changed).
function isAuthorizedCronRequest(req: NextRequest, secret: string): boolean {
  const provided = req.headers.get("x-cron-secret");
  if (provided === secret) return true;
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Not user-facing: meant to be hit by an external scheduler (a Railway Cron
// Job, or a free service like cron-job.org) on something like a daily
// schedule. Protected by a shared secret header instead of user auth, since
// there's no logged-in user in that context.
//
// Usage:
//   curl -X POST https://<your-app>/api/internal/notifications/check-deadlines \
//     -H "x-cron-secret: $CRON_SECRET"
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    console.error("CHECK-DEADLINES ERROR: CRON_SECRET is not set");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  if (!isAuthorizedCronRequest(req, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await checkDeadlines();
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("CHECK-DEADLINES ERROR:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}

// Convenience for a quick manual/browser-based check with the secret as a
// query param, since some cron-ping services only support GET.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const queryProvided = req.nextUrl.searchParams.get("secret");

  if (!secret || (!isAuthorizedCronRequest(req, secret) && queryProvided !== secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await checkDeadlines();
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("CHECK-DEADLINES ERROR:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
