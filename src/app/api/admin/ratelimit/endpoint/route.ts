import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId || !sessionClaims?.superAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const endpoint = req.nextUrl.searchParams.get("endpoint");
  if (!endpoint) {
    return NextResponse.json({ error: "endpoint is required" }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    endpoint,
    status: "Rate limit inspection placeholder (no rate limiter configured)",
  });
}
