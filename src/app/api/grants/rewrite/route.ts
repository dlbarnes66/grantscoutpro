import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/**
 * Analyze compliance gaps between the user's profile and the grant.
 */
function analyzeCompliance(grant: any, profile: any) {
  const reasons: string[] = [];
  const fixes: string[] = [];

  if (grant.geography && profile.geography) {
    if (!grant.geography.includes(profile.geography)) {
      reasons.push(`Grant is limited to: ${grant.geography.join(", ")}`);
      fixes.push(`Expand operations or partnerships in: ${grant.geography.join(", ")}`);
    }
  }

  if (grant.focusAreas && profile.focusAreas) {
    const overlap = grant.focusAreas.filter((fa: string) =>
      profile.focusAreas.includes(fa)
    );
    if (overlap.length === 0) {
      reasons.push(`Required focus areas: ${grant.focusAreas.join(", ")}`);
      fixes.push(`Develop or highlight programs in: ${grant.focusAreas.join(", ")}`);
    }
  }

  if (grant.projectTypes && profile.projectTypes) {
    const overlap = grant.projectTypes.filter((pt: string) =>
      profile.projectTypes.includes(pt)
    );
    if (overlap.length === 0) {
      reasons.push(`Required project types: ${grant.projectTypes.join(", ")}`);
      fixes.push(`Plan or document projects in: ${grant.projectTypes.join(", ")}`);
    }
  }

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
 * GET — operational check
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    message: "Grant rewrite endpoint operational.",
  });
}

/**
 * POST — rewrite grant narrative using AI + compliance analysis
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { grantId, content } = await req.json().catch(() => ({}));

    if (!grantId || !content) {
      return NextResponse.json(
        { error: "Missing grantId or content" },
        { status: 400 }
      );
    }

    // Load grant
    const grant = await prisma.grant.findUnique({
      where: { id: grantId },
    });

    if (!grant) {
      return NextResponse.json(
        { error: "Grant not found" },
        { status: 404 }
      );
    }

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

    // Compliance analysis
    const compliance = analyzeCompliance(grant, profile);

    // AI rewrite
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert grant writer. Rewrite the user's content to be clearer, stronger, more persuasive, and aligned with best practices. Provide improvements and weaknesses.",
        },
        {
          role: "user",
          content: content,
        },
      ],
      temperature: 0.4,
    });

    const rewritten = aiResponse.choices[0].message.content || "";

    // AI improvement analysis
    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Analyze the rewritten grant narrative. Provide a list of improvements made and weaknesses still present.",
        },
        {
          role: "user",
          content: rewritten,
        },
      ],
      temperature: 0.3,
    });

    const analysis = analysisResponse.choices[0].message.content || "";

    return NextResponse.json({
      success: true,
      rewritten,
      analysis,
      compliance: {
        qualifies: compliance.qualifies,
        reasons: compliance.reasons,
        fixes: compliance.fixes,
        sideCard: {
          title: compliance.qualifies
            ? "You qualify for this grant"
            : "Why you don’t qualify",
          reasons: compliance.reasons,
          fixes: compliance.fixes,
        },
      },
    });
  } catch (err: any) {
    console.error("GRANTS REWRITE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
