import { NextRequest } from "next/server";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  context: {
    params: Record<string, string>;
  }
) {
  const { params } = context;

  const h = await headers();

  const user =
    h.get("x-user-id") ||
    "unknown";

  return Response.json({
    ok: true,
    user,
    message: "Settings route is dynamic and safe.",
  });
}