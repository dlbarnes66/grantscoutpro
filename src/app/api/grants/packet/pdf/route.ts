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

    // Fetch the grant and all related data needed for PDF generation
    const grant = await prisma.grant.findUnique({
      where: { id: grantId },
      include: {
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

    // Your PDF generation logic goes here
    // For now, return the grant data
    return NextResponse.json({ success: true, grant });
  } catch (err: any) {
    console.error("PACKET PDF ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
