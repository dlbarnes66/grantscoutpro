import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id as string | undefined;
    const orgId = session?.user?.orgId as string | undefined;

    if (!session || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!orgId) {
      return NextResponse.json({ error: "User is not assigned to an org" }, { status: 403 });
    }

    const url = new URL(req.url);
    const sharedId = url.searchParams.get("sharedId");

    if (!sharedId) {
      return NextResponse.json({ error: "sharedId is required" }, { status: 400 });
    }

    const shared = await prisma.sharedResource.findUnique({
      where: { id: sharedId },
      include: { accesses: true },
    });

    if (!shared) {
      return NextResponse.json({ error: "Shared resource not found" }, { status: 404 });
    }

    const hasAccess =
      shared.ownerOrgId === orgId ||
      shared.sharedWithId === orgId ||
      shared.accesses.some((a) => a.orgId === orgId);

    return NextResponse.json({
      success: true,
      hasAccess,
      shared,
    });
  } catch (err: any) {
    console.error("ORG SHARE CHECK ERROR:", err);
    return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 });
  }
}
