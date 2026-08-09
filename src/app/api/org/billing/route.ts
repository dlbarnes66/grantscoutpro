import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id as string | undefined;
    const orgId = session?.user?.orgId as string | undefined;
    const role = session?.user?.role as string | undefined;
    const superAdmin = session?.user?.superAdmin as boolean | undefined;

    if (!session || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!orgId) {
      return NextResponse.json({ error: "User is not assigned to an org" }, { status: 403 });
    }

    if (role !== "org_admin" && !superAdmin) {
      return NextResponse.json({ error: "Forbidden: org admin required" }, { status: 403 });
    }

    const workspaces = await prisma.workspace.findMany({
      where: { orgId },
      include: {
        billing: true,
      },
    });

    const summary = workspaces.map((ws) => ({
      workspaceId: ws.id,
      name: ws.name,
      subscriptionTier: ws.subscriptionTier,
      billingStatus: ws.billingStatus,
      billingPeriod: ws.billingPeriod,
      billingRenewalDate: ws.billingRenewalDate,
      billing: ws.billing,
    }));

    return NextResponse.json({
      success: true,
      orgId,
      workspaces: summary,
    });
  } catch (err: any) {
    console.error("ORG BILLING SUMMARY ERROR:", err);
    return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 });
  }
}
