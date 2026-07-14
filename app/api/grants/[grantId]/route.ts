import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { grantId: string } }
) {
  const grant = await prisma.grant.findUnique({
    where: { id: params.grantId },
    include: {
      narratives: true,
      documents: true,
      GrantDraft: true,
      GrantSection: true,
      ClusterAssignment: true,
      applicationHistories: true,
      submissionHistory: true,
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
    },
  });

  if (!grant) {
    return NextResponse.json({ error: "Grant not found" }, { status: 404 });
  }

  return NextResponse.json(grant);
}

export async function PATCH(
  req: Request,
  { params }: { params: { grantId: string } }
) {
  const body = await req.json();

  const grant = await prisma.grant.update({
    where: { id: params.grantId },
    data: body,
  });

  return NextResponse.json(grant);
}

export async function DELETE(
  req: Request,
  { params }: { params: { grantId: string } }
) {
  await prisma.grant.delete({
    where: { id: params.grantId },
  });

  return NextResponse.json({ deleted: true });
}
