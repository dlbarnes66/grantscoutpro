import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { headers } from "next/headers";

export async function GET(req: NextRequest, context: { params: Record<string, string> }) {
  const { params } = context;
  const h = headers();
  const user = h.get("x-user-id") || "unknown";

  return Response.json({
    ok: true,
    user,
    message: "Profile history route is dynamic and safe.",
  });
}
