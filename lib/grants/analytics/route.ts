import { NextResponse } from "next/server";
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

    const analytics = await getAnalytics({
      workspaceId,
      tier,
    });

    return NextResponse.json(analytics);
  } catch (err: any) {
    console.error("Analytics error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
