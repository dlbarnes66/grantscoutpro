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

    // Fetch full user from DB because session.user does NOT contain email
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const superadminEmail = process.env.SUPERADMIN_EMAIL;

    if (!superadminEmail || user.email !== superadminEmail) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Your database does NOT contain any AI usage tables.
    // So we return zeroed-out analytics for now.
    const usage = {
      totalRequests: 0,
      totalTokens: 0,
      perUser: [],
    };

    return NextResponse.json({
      success: true,
      usage,
    });
  } catch (err: any) {
    console.error("AI USAGE ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
