import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request, { params }: any) {
  // Clerk authentication
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { grantId } = params;

  // Mock AI output (replace with real model later)
  const scores = {
    aiEligibilityScore: Math.floor(Math.random() * 100),
    aiAlignmentScore: Math.floor(Math.random() * 100),
    aiCompetitivenessScore: Math.floor(Math.random() * 100),
    aiRiskScore: Math.floor(Math.random() * 100),
    aiReadinessScore: Math.floor(Math.random() * 100),
    aiSummary: "This grant appears to be a strong match based on eligibility and alignment.",
    aiRecommendations: [
      "Strengthen narrative clarity.",
      "Add more evidence-based justification.",
      "Improve budget alignment.",
    ],
  };

  // Update grant with AI scores
  await prisma.grant.update({
    where: { id: grantId },
    data: scores,
  });

  // Log AI usage
  await prisma.aiUsage.create({
    data: {
      workspaceId: "unknown", // replace later when workspace context is available
      userId,
      feature: "grant_ai_analysis",
      tokens: 100,
      cost: 0.02,
    },
  });

  return NextResponse.json({ success: true });
}
