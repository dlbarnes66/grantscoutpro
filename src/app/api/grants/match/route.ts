import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Simple scoring function:
 * - Compares org focus areas, geography, and project types
 * - Scores 0–100
 */
function computeMatchScore(grant: any, profile: any) {
  let score = 0;

  // Geography match
  if (grant.geography && profile.geography) {
    if (grant.geography.includes(profile.geography)) score += 30;
  }

  // Focus area match
  if (grant.focusAreas && profile.focusAreas) {
    const overlap = grant.focusAreas.filter((fa: string) =>
      profile.focusAreas.includes(fa)
    );
    score += overlap.length * 10;
  }

  // Project type match
  if (grant.projectTypes && profile.projectTypes) {
    const overlap = grant.projectTypes.filter((pt: string) =>
      profile.projectTypes.includes(pt)
    );
    score += overlap.length * 10;
  }

  // Social media inferred tags
  if (profile.inferredTags && grant.tags) {
    const overlap = grant.tags.filter((t: string) =>
      profile.inferredTags.includes(t)
    );
    score += overlap.length * 5;
  }

  return Math.min(score, 100);
}

/**
 * GET — Debug / simple check
 */
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    message: "Grant matching endpoint operational.",
  });
}

/**
 * POST — Full matching engine
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Load user profile
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "User profile not found. Complete onboarding first." },
        { status: 400 }
      );
    }

    // Load all grants
    const grants = await prisma.grant.findMany({
      where: {
        status: "active",
      },
    });

    // Score each grant
    const scored = grants.map((grant) => ({
      grant,
      score: computeMatchScore(grant, profile),
    }));

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      success: true,
      count: scored.length,
      matches: scored,
    });
  } catch (err: any) {
    console.error("GRANTS MATCH ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
