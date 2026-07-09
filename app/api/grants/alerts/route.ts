import { NextResponse } from "next/server";
import { generateAlerts } from "@/lib/grants/alerts/generateAlerts";

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

    const alerts = await generateAlerts({
      workspaceId,
      tier,
    });

    return NextResponse.json(alerts);
  } catch (err: any) {
    console.error("Alerts error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
