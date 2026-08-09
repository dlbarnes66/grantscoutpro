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
    const { name } = body as { name?: string };

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Invalid org name" }, { status: 400 });
    }

    const org = await prisma.org.update({
      where: { id: orgId },
      data: { name },
    });

    await prisma.auditLog.create({
      data: {
        orgId,
        userId,
        action: "org_update",
        metadata: { name },
      },
    });

    return NextResponse.json({ success: true, org });
  } catch (err: any) {
    console.error("ORG UPDATE ERROR:", err);
    return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 });
  }
}
