import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId || !sessionClaims?.superAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orgId = req.nextUrl.searchParams.get("orgId");

  return NextResponse.json({
    success: true,
    orgId,
    status: "Org rate limit inspection placeholder",
  });
}
