import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await context.params;
    const body = await request.json();

    const userId = body.userId;
    const grantId = body.grantId;
    const details = body.details;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing workspaceId" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    if (!grantId) {
      return NextResponse.json(
        { error: "Missing grantId" },
        { status: 400 }
      );
    }

    // Ensure the grant belongs to this workspace
    const grant = await prisma.grant.findUnique({
      where: { id: grantId },
      select: { workspaceId: true }
    });

    if (!grant || grant.workspaceId !== workspaceId) {
      return NextResponse.json(
        { error: "Grant does not belong to this workspace" },
        { status: 403 }
      );
    }

    const result = await prisma.portfolioOptimization.upsert({
      where: {
        // You may want a composite key later, but for now:
        id: body.id ?? `${userId}-${grantId}`
      },
      update: {
        userId,
        grantId,
        details
      },
      create: {
        id: body.id ?? `${userId}-${grantId}`,
        userId,
        grantId,
        details
      }
    });

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error("PORTFOLIO OPTIMIZATION ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
