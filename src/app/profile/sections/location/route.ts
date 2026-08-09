import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/nextauth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: NextRequest, context: { params: Record<string, string> }) {
  const { params } = context;
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
      select: {
        country: true,
        state: true,
        city: true,
      },
    });

    return NextResponse.json({
      success: true,
      location: profile,
    });
  } catch (err: any) {
    console.error("PROFILE LOCATION GET ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, context: { params: Record<string, string> }) {
  const { params } = context;
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: No user session" },
        { status: 401 }
      );
    }

    const location = await req.json();

    // Update UserProfile, NOT User
    const updated = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        country: location.country,
        state: location.state,
        city: location.city,
      },
      create: {
        userId,
        country: location.country,
        state: location.state,
        city: location.city,
      },
    });

    return NextResponse.json({
      success: true,
      location: updated,
    });
  } catch (err: any) {
    console.error("PROFILE LOCATION POST ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
