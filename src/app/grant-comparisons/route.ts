export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { headers } from "next/headers";

export async function GET() {
  const h = headers();
  const user = h.get("x-user-id") || "unknown";

  return Response.json({
    ok: true,
    user,
    message: "Grant comparisons route is dynamic and safe.",
  });
}
