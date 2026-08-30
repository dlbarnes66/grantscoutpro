import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const h = await headers();
  const user = h.get("x-user-id") || "unknown";

  return NextResponse.json({
    ok: true,
    user,
    message: "Grant comparisons route is dynamic and safe.",
  });
}
