import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
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

    const body = await req.json().catch(() => ({}));
    const { sharedId, targetOrgId } = body as { sharedId?: string; targetOrgId?: string };

    if (!sharedId || !targetOrgId) {
      return NextResponse.json({ error: "sharedId and targetOrgId are required" }, { status: 400 });
    }

    const shared = await prisma.sharedResource.findUnique({
      where: { id: sharedId },
    });

    if (!shared || shared.ownerOrgId !== orgId) {
      return NextResponse.json({ error: "Shared resource not owned by this org" }, { status: 403 });
    }

    await prisma.sharedAccess.deleteMany({
      where: {
        sharedId,
        orgId: targetOrgId,
      },
    });

    await prisma.auditLog.create({
      data: {
        orgId,
        userId,
        action: "org_share_revoke",
        metadata: { sharedId, targetOrgId },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("ORG SHARE REVOKE ERROR:", err);
    return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 });
  }
}
