import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRIORITY = ["iad1", "sfo1", "dub1", "hnd1"];

async function check(region: string) {
  try {
    const url = `https://${region}.yourdomain.com/api/regions/health`;
    const res = await fetch(url, { cache: "no-store" });
    const json = await res.json();
    return json.status === "healthy";
  } catch {
    return false;
  }
}

export async function GET() {
  for (const region of PRIORITY) {
    const healthy = await check(region);
    if (healthy) {
      return NextResponse.json({
        activeRegion: region,
        reason: "healthy",
        timestamp: new Date().toISOString(),
      });
    }
  }

  return NextResponse.json({
    activeRegion: "none",
    reason: "all regions unhealthy",
    timestamp: new Date().toISOString(),
  });
}
