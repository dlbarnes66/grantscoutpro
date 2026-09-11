import { NextRequest, NextResponse } from "next/server";
import { runGrantScan } from "@/lib/grants/runGrantScan";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// Without this, Vercel kills the function at its plan's short default
// timeout (as little as 10s) - runGrantScan() loops every workspace doing
// several slow external calls each (website rescan, Grants.gov, state
// scraping, IRS filings, up to 15 OpenAI scoring calls), so it easily
// takes well past that. 300s is the maximum allowed on Vercel's Pro plan
// for a standard serverless function (Hobby caps at 60s, which is what
// this was set to before - too short in practice, confirmed by a real
// FUNCTION_INVOCATION_TIMEOUT). Raise further only if Fluid Compute is
// enabled on this project and 300s still isn't enough as more workspaces
// get added.
export const maxDuration = 300;

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
