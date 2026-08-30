import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = sessionClaims?.orgId as string | undefined;
  const role = sessionClaims?.role as string | undefined;
  const superAdmin = sessionClaims?.superAdmin as boolean | undefined;

  if (!orgId) {
    return NextResponse.json({ error: "User is not assigned to an org" }, { status: 403 });
  }

  if (role !== "org_admin" && !superAdmin) {
    return NextResponse.json({ error: "Forbidden: org admin required" }, { status: 403 });
  }

  try {
    const workspaces = await prisma.workspace.findMany({
      where: { orgId },
      include: { billing: true },
    });

    const totalUsage = workspaces.reduce(
      (acc, ws) => {
        if (!ws.billing) return acc;
        acc.searches += ws.billing.usageSearches;
        acc.uploads += ws.billing.usageUploads;
        acc.members += ws.billing.usageMembers;
        acc.ai += ws.billing.usageAI;
        return acc;
      },
      { searches: 0, uploads: 0, members: 0, ai: 0 }
    );

    await prisma.auditLog.create({
      data: {
        orgId,
        userId,
        action: "org_billing_consolidate",
        metadata: { totalUsage },
      },
    });

    return NextResponse.json({ success: true, orgId, totalUsage });
  } catch (err: any) {
    console.error("ORG BILLING CONSOLIDATE ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
