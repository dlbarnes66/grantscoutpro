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

    // Fetch full user from DB
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

    // Your User model does NOT contain any billing or trial fields.
    // So we return zeroed-out analytics for now.
    const billing = {
      trialUsers: 0,
      activeSubscriptions: 0,
      mrr: 0,
    };

    return NextResponse.json({
      success: true,
      billing,
    });
  } catch (err: any) {
    console.error("SUPERADMIN BILLING ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
