export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { generateAlerts } from "@/lib/grants/alerts/generateAlerts";

export async function POST(request: NextRequest) {
  try {
    const { workspaceId, tier } = await request.json();

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing workspaceId" },
        { status: 400 }
      );
    }

    const alerts = await generateAlerts({
      workspaceId,
      tier,
    });

    return NextResponse.json(alerts);
  } catch (err: any) {
    console.error("Alerts error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
