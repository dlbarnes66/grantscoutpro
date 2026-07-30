export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";




export async function POST(req: Request) {
  try {
    const { sourceOrgId, newOrgId, userIds } = await req.json();

    if (!sourceOrgId || !newOrgId || !Array.isArray(userIds)) {
      return NextResponse.json(
        { error: "sourceOrgId, newOrgId, and userIds[] are required" },
        { status: 400 }
      );
    }

    // Stubbed: your schema has no orgId fields or organization models.
    // This endpoint is kept for UI compatibility but does not perform DB changes.
    return NextResponse.json({
      status: "ok",
      message: "Move audit logs stubbed (no-op). No database changes performed.",
      sourceOrgId,
      newOrgId,
      affectedUsers: userIds.length,
    });
  } catch (err: any) {
    console.error("Move audit logs error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
