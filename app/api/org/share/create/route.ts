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

    const shared = await prisma.sharedResource.create({
      data: {
        ownerOrgId: orgId,
        resourceId,
        resourceType,
      },
    });

    return NextResponse.json({ shared });
  } catch (err: any) {
    console.error("Shared resource create error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
