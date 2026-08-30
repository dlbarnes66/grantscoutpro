import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Analyze compliance gaps and produce a “side card” explanation.
 */
function analyzeNonCompliance(grant: any, profile: any) {
  const reasons: string[] = [];
  const fixes: string[] = [];

  // Geography mismatch
  if (grant.geography && profile.geography) {
    if (!grant.geography.includes(profile.geography)) {
      reasons.push(`This grant is limited to: ${grant.geography.join(", ")}`);
      fixes.push(`Expand operations or partnerships in ${grant.geography.join(", ")}`);
    }
  }

  // Focus area mismatch
  if (grant.focusAreas && profile.focusAreas) {
    const overlap = grant.focusAreas.filter((fa: string) =>
      profile.focusAreas.includes(fa)
    );
    if (overlap.length === 0) {
      reasons.push(`Your organization does not match the required focus areas: ${grant.focusAreas.join(", ")}`);
      fixes.push(`Develop or highlight programs in: ${grant.focusAreas.join(", ")}`);
    }
  }

  // Project type mismatch
  if (grant.projectTypes && profile.projectTypes) {
    const overlap = grant.projectTypes.filter((pt: string) =>
      profile.projectTypes.includes(pt)
    );
    if (overlap.length === 0) {
      reasons.push(`Required project types: ${grant.projectTypes.join(", ")}`);
      fixes.push(`Plan or document projects in: ${grant.projectTypes.join(", ")}`);
    }
  }

  // Social media inferred tags mismatch
  if (grant.tags && profile.inferredTags) {
    const overlap = grant.tags.filter((t: string) =>
      profile.inferredTags.includes(t)
    );
    if (overlap.length === 0) {
      reasons.push(`Your online presence does not reflect the grant’s themes: ${grant.tags.join(", ")}`);
      fixes.push(`Post or highlight content related to: ${grant.tags.join(", ")}`);
    }
  }

  return {
    qualifies: reasons.length === 0,
    reasons,
    fixes,
  };
}

/**
 * Compute match score (0–100)
 */
function computeMatchScore(grant: any, profile: any) {
  let score = 0;

  if (grant.geography?.includes(profile.geography)) score += 30;

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

  if (grant.tags && profile.inferredTags) {
    const overlap = grant.tags.filter((t: string) =>
      profile.inferredTags.includes(t)
    );
    score += overlap.length * 5;
  }

  return Math.min(score, 100);
}

/**
 * GET — simple operational check
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    message: "Grant recommendation endpoint operational.",
  });
}

/**
 * POST — full recommendation engine with compliance analysis
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
      where: { status: "active" },
    });

    const recommended: any[] = [];
    const nonQualifying: any[] = [];

    for (const grant of grants) {
      const score = computeMatchScore(grant, profile);
      const compliance = analyzeNonCompliance(grant, profile);

      if (compliance.qualifies) {
        recommended.push({ grant, score });
      } else {
        nonQualifying.push({
          grant,
          score,
          sideCard: {
            title: "Why you don’t qualify",
            reasons: compliance.reasons,
            fixes: compliance.fixes,
          },
        });
      }
    }

    // Sort recommended by score
    recommended.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      success: true,
      recommended,
      nonQualifying,
    });
  } catch (err: any) {
    console.error("GRANTS RECOMMEND ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
