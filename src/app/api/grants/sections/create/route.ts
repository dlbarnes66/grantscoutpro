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
 * Compliance analysis for section creation.
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
    message: "Grant section creation endpoint operational.",
  });
}

/**
 * POST — AI section creation
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { grantId, sectionTitle, instructions } = await req.json().catch(() => ({}));

    if (!grantId || !sectionTitle) {
      return NextResponse.json(
        { error: "Missing grantId or sectionTitle" },
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

    // AI section generation
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert grant writer. Create a complete grant section based on the title and instructions. Make it persuasive, compliant, and aligned with best practices.",
        },
        {
          role: "user",
          content: `
Section Title: ${sectionTitle}
Grant Requirements: ${JSON.stringify(grant)}
Organization Profile: ${JSON.stringify(profile)}
Instructions: ${instructions || "None provided"}
          `,
        },
      ],
      temperature: 0.4,
    });

    const sectionContent = aiResponse.choices[0].message.content || "";

    // AI improvement analysis
    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Analyze the created grant section. Provide improvements and weaknesses.",
        },
        {
          role: "user",
          content: sectionContent,
        },
      ],
      temperature: 0.3,
    });

    const analysis = analysisResponse.choices[0].message.content || "";

    return NextResponse.json({
      success: true,
      section: {
        title: sectionTitle,
        content: sectionContent,
        analysis,
      },
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
    console.error("GRANTS SECTION CREATE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
