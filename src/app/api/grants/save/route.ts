export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { grantId } = await request.json();

    if (!grantId) {
      return NextResponse.json(
        { error: "Missing grantId" },
        { status: 400 }
      );
    }

    // Ensure the grant exists
    const grant = await prisma.grant.findUnique({
      where: { id: grantId },
    });

    if (!grant) {
      return NextResponse.json(
        { error: "Grant not found" },
        { status: 404 }
      );
    }

    // Save the grant
    const saved = await prisma.savedGrant.create({
      data: {
        userId,
        grantId,
      },
    });

    return NextResponse.json({
      success: true,
      saved,
    });
  } catch (err: any) {
    console.error("SAVE GRANT ERROR:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
