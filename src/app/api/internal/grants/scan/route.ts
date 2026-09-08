import { NextRequest, NextResponse } from "next/server";
import { runGrantScan } from "@/lib/grants/runGrantScan";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Not user-facing - meant to be hit by an external scheduler (a Railway
// Cron Job, or a free service like cron-job.org) twice a day, same
// pattern as /api/internal/notifications/check-deadlines. Protected by
// the same shared CRON_SECRET.
//
// Usage:
//   curl -X POST https://<your-app>/api/internal/grants/scan \
//     -H "x-cron-secret: $CRON_SECRET"
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    console.error("GRANT SCAN ERROR: CRON_SECRET is not set");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const provided = req.headers.get("x-cron-secret");
  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runGrantScan();
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("GRANT SCAN ERROR:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}

// Convenience for cron-ping services that only support GET.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const provided = req.headers.get("x-cron-secret") || req.nextUrl.searchParams.get("secret");

  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runGrantScan();
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("GRANT SCAN ERROR:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
