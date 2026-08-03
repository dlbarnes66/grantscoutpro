import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAnalytics } from "@/lib/grants/analytics/getAnalytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { workspaceId, tier } = await req.json();

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing workspaceId" },
        { status: 400 }
      );
    }

    // ⭐ Fetch grants for this workspace
    const grants = await prisma.grant.findMany({
      where: { workspaceId },
    });

    // ⭐ Correct call — pass (grants, tier)
    const analytics = await getAnalytics(grants, tier);

    return NextResponse.json(analytics);
  } catch (err: any) {
    console.error("Analytics error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
