import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  const { userId, sessionClaims } = await auth();
  if (!userId || !sessionClaims?.superAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // ---------------------------------------------
    // 1. PURGE ARCHIVED GRANTS (valid field)
    // ---------------------------------------------
    const deletedGrants = await prisma.grant.deleteMany({
      where: { status: "archived" },
    });

    // ---------------------------------------------
    // 2. PURGE OLD AUDIT LOGS (no archived flag exists)
    // ---------------------------------------------
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deletedAuditLogs = await prisma.auditLog.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
      },
    });

    // ---------------------------------------------
    // 3. PURGE APPLICATIONS WITH NO CONTENT (no status field exists)
    // ---------------------------------------------
    const deletedApplications = await prisma.application.deleteMany({
      where: {
        content: null,
      },
    });

    return NextResponse.json({
      success: true,
      deleted: {
        grants: deletedGrants.count,
        auditLogs: deletedAuditLogs.count,
        applications: deletedApplications.count,
      },
    });

  } catch (err: any) {
    console.error("PURGE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
