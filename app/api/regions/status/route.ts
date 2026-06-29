import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REGIONS = [
  "iad1", // US East
  "sfo1", // US West
  "dub1", // Europe
  "hnd1", // Asia
];

async function check(region: string) {
  try {
    const url = `https://${region}.yourdomain.com/api/regions/health`;
    const res = await fetch(url, { cache: "no-store" });
    const json = await res.json();

    return {
      region,
      healthy: json.status === "healthy",
      timestamp: json.timestamp,
    };
  } catch {
    return {
      region,
      healthy: false,
      timestamp: new Date().toISOString(),
    };
  }
}

export async function GET() {
  const results = [];

  for (const region of REGIONS) {
    results.push(await check(region));
  }

  return NextResponse.json({ regions: results });
}
