import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id as string | undefined;
    const orgId = session?.user?.orgId as string | undefined;
    const superAdmin = session?.user?.superAdmin as boolean | undefined;

    if (!session || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!orgId) {
      return NextResponse.json({ error: "User is not assigned to an org" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      where: { orgId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        superAdmin: true,
        orgId: true,
      },
    });

    return NextResponse.json({ success: true, users, orgId, superAdmin: !!superAdmin });
  } catch (err: any) {
    console.error("ORG USER LIST ERROR:", err);
    return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 });
  }
}

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
    const { targetUserId, newRole } = body as { targetUserId?: string; newRole?: string };

    if (!targetUserId || !newRole) {
      return NextResponse.json({ error: "targetUserId and newRole are required" }, { status: 400 });
    }

    const target = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!target || target.orgId !== orgId) {
      return NextResponse.json({ error: "User not found in this org" }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
    });

    await prisma.auditLog.create({
      data: {
        orgId,
        userId,
        action: "org_user_role_update",
        metadata: { targetUserId, newRole },
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    console.error("ORG USER UPDATE ERROR:", err);
    return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 });
  }
}
