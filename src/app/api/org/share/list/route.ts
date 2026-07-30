export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { orgId } = await req.json();

    if (!orgId) {
      return NextResponse.json(
        { success: false, error: "orgId is required" },
        { status: 400 }
      );
    }

    // ⭐ FIXED — use "accesses" instead of "access"
    const owned = await prisma.sharedResource.findMany({
      where: { ownerOrgId: orgId },
      include: { accesses: true },
    });

    const accessible = await prisma.sharedAccess.findMany({
      where: { orgId },
      include: { shared: true },
    });

    return NextResponse.json({
      success: true,
      owned,
      accessible,
    });
  } catch (error) {
    console.error("ORG SHARE LIST ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list shared resources" },
      { status: 500 }
    );
  }
}
