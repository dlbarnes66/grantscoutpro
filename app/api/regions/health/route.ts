import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    region: process.env.VERCEL_REGION || "unknown",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
}
