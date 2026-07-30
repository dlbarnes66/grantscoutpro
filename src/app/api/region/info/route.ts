export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";




export async function GET(req: Request) {
  const region = process.env.VERCEL_REGION || "unknown";

  return NextResponse.json({
    region,
    timestamp: new Date().toISOString(),
  });
}
