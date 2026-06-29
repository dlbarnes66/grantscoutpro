import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { orgId, resourceId, resourceType } = await req.json();

    if (!orgId || !resourceId || !resourceType) {
      return NextResponse.json(
        { error: "Missing orgId, resourceId, or resourceType" },
        { status: 400 }
      );
    }

    // Check if org owns the resource
    const owned = await prisma.sharedResource.findFirst({
      where: {
        ownerOrgId: orgId,
        resourceId,
        resourceType,
      },
    });

    if (owned) {
      return NextResponse.json({ allowed: true, reason: "owner" });
    }

    // Check if org has been granted access
    const access = await prisma.sharedAccess.findFirst({
      where: {
        orgId,
        shared: {
          resourceId,
          resourceType,
        },
      },
    });

    return NextResponse.json({
      allowed: !!access,
      reason: access ? "granted" : "none",
    });
  } catch (err: any) {
    console.error("Access check error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
