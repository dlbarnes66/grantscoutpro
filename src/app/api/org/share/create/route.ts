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
    const { resourceId, sharedWithOrgId } = body as {
      resourceId?: string;
      sharedWithOrgId?: string;
    };

    if (!resourceId) {
      return NextResponse.json({ error: "resourceId is required" }, { status: 400 });
    }

    const sharedResource = await prisma.sharedResource.create({
      data: {
        resourceId,
        ownerOrgId: orgId,
        sharedWithId: sharedWithOrgId ?? null,
      },
    });

    await prisma.auditLog.create({
      data: {
        orgId,
        userId,
        action: "org_share_create",
        metadata: { resourceId, sharedWithOrgId },
      },
    });

    return NextResponse.json({ success: true, sharedResource });
  } catch (err: any) {
    console.error("ORG SHARE CREATE ERROR:", err);
    return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 });
  }
}
