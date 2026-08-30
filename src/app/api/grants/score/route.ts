import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function computeReadinessScore(grant: any, profile: any) {
  let score = 0;

  if (grant.geography?.includes(profile.geography)) score += 25;

  if (grant.focusAreas && profile.focusAreas) {
    const overlap = grant.focusAreas.filter((fa: string) =>
      profile.focusAreas.includes(fa)
    );
    score += overlap.length * 10;
  }

  if (grant.projectTypes && profile.projectTypes) {
    const overlap = grant.projectTypes.filter((pt: string) =>
      profile.projectTypes.includes(pt)
    );
    score += overlap.length * 10;
  }

  if (profile.readinessLevel) {
    score += profile.readinessLevel * 5;
  }

  return Math.min(score, 100);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { grantId } = await req.json().catch(() => ({}));
    if (!grantId) {
      return NextResponse.json(
        { error: "Missing grantId" },
        { status: 400 }
      );
    }

    const grant = await prisma.grant.findUnique({ where: { id: grantId } });
    if (!grant) {
      return NextResponse.json(
        { error: "Grant not found" },
        { status: 404 }
      );
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 400 }
      );
    }

    const score = computeReadinessScore(grant, profile);

    return NextResponse.json({
      success: true,
      score,
    });
  } catch (err: any) {
    console.error("GRANTS SCORE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
