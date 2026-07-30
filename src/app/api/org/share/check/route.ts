export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";



export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { orgId, resourceId } = await req.json();

    if (!orgId || !resourceId) {
      return NextResponse.json(
        { error: "Missing orgId or resourceId" },
        { status: 400 }
      );
    }

    // Check if the resource is shared with this org
    const shared = await prisma.sharedResource.findFirst({
      where: {
        ownerOrgId: orgId,
        resourceId,
      },
    });

    if (!shared) {
      return NextResponse.json(
        { shared: false, reason: "Resource is not shared with this organization" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      shared: true,
    });
  } catch (err: any) {
    console.error("ORG SHARE CHECK ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
