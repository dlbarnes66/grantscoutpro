import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const region = process.env.VERCEL_REGION || "unknown";

  return NextResponse.json({
    region,
    timestamp: new Date().toISOString(),
  });
}
