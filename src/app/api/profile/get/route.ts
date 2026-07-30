export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const profile = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("PROFILE GET ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
