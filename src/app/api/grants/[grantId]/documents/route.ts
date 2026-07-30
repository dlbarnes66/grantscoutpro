import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ grantId: string }> }
) {
  const { grantId } = await context.params;

  try {
    const grant = await prisma.grant.findUnique({
      where: { id: grantId },
      include: {
        submissionHistory: true,
        reviewerHistory: true,
        narratives: true,
        // add any other relations you need
      },
    });

    if (!grant) {
      return NextResponse.json(
        { error: "Grant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(grant);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Failed to load grant" },
      { status: 500 }
    );
  }
}
