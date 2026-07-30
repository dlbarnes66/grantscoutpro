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

    // Create shared resource using ONLY valid Prisma fields
    const shared = await prisma.sharedResource.create({
      data: {
        ownerOrgId: orgId,
        resourceId,
      },
    });

    return NextResponse.json({
      success: true,
      shared,
    });
  } catch (err: any) {
    console.error("ORG SHARE CREATE ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
