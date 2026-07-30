import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ grantId: string }> }
) {
  try {
    const { grantId } = await context.params;

    if (!grantId) {
      return NextResponse.json(
        { error: "Missing grantId" },
        { status: 400 }
      );
    }

    const grant = await prisma.grant.findUnique({
      where: { id: grantId },
      include: {
        submissionHistory: true,
        renewalHistory: true,
        reviewerHistory: true,
        riskHistory: true,
        writingCoachHistory: true,
        forecastHistory: true,
        matchingHistory: true,
        opportunityHistory: true,
        rewriteHistory: true,
        panelHistory: true,
        gapsHistory: true,
        narrativeHistory: true,
        agentHistory: true,
        complianceHistory: true,
        closeoutHistory: true,
        eligibilityHistory: true,
        autoeditorHistory: true,
        successProbabilityHistory: true,
        compareHistory: true,
        portfolioHistory: true,
        negotiationHistory: true,
        monitoringHistory: true,
        outreachHistory: true,
        budgetHistory: true,
        narratives: true,
        documents: true,
        GrantDraft: true,
        GrantSection: true,
        ClusterAssignment: true,
        SavedGrant: true,
        PortfolioOptimization: true,
        GrantAccess: true,
        workspace: true
      }
    });

    if (!grant) {
      return NextResponse.json(
        { error: "Grant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(grant);
  } catch (err: any) {
    console.error("GRANT ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
