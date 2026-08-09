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

    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit") ?? 50);
    const cursor = url.searchParams.get("cursor") ?? undefined;

    const logs = await prisma.auditLog.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    return NextResponse.json({
      success: true,
      logs,
      nextCursor: logs.length === limit ? logs[logs.length - 1].id : null,
    });
  } catch (err: any) {
    console.error("ORG AUDIT LIST ERROR:", err);
    return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 });
  }
}
