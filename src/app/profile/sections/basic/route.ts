import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: No user session" },
        { status: 401 }
      );
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    return NextResponse.json({
      success: true,
      basic: profile,
    });
  } catch (err: any) {
    console.error("PROFILE BASIC GET ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: No user session" },
        { status: 401 }
      );
    }

    const basic = await req.json();

    // Update the UserProfile, NOT User
    const updated = await prisma.userProfile.upsert({
      where: { userId },
      update: basic,
      create: {
        userId,
        ...basic,
      },
    });

    return NextResponse.json({
      success: true,
      basic: updated,
    });
  } catch (err: any) {
    console.error("PROFILE BASIC POST ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
