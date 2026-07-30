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
      select: {
        strategicGoals: true,
        priorityAreas: true,
      },
    });

    return NextResponse.json({
      success: true,
      strategy: profile,
    });
  } catch (err: any) {
    console.error("PROFILE STRATEGY GET ERROR:", err);
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

    const strategy = await req.json();

    const updated = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        strategicGoals: strategy.strategicGoals,
        priorityAreas: strategy.priorityAreas,
      },
      create: {
        userId,
        strategicGoals: strategy.strategicGoals,
        priorityAreas: strategy.priorityAreas,
      },
    });

    return NextResponse.json({
      success: true,
      strategy: updated,
    });
  } catch (err: any) {
    console.error("PROFILE STRATEGY POST ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
