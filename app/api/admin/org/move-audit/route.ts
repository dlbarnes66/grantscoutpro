import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { sourceOrgId, newOrgId, userIds } = await req.json();

    if (!sourceOrgId || !newOrgId || !userIds) {
      return NextResponse.json(
        { error: "Missing sourceOrgId, newOrgId, or userIds" },
        { status: 400 }
      );
    }

    const logs = await prisma.auditLog.updateMany({
      where: {
        orgId: sourceOrgId,
        actorId: { in: userIds },
      },
      data: { orgId: newOrgId },
    });

    return NextResponse.json({ moved: logs.count });
  } catch (err: any) {
    console.error("Move audit logs error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
