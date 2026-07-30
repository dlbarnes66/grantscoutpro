export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { grantId } = await request.json();

    if (!grantId) {
      return NextResponse.json(
        { error: "Missing grantId" },
        { status: 400 }
      );
    }

    // Load grant using the correct Prisma model
    const grant = await prisma.grant.findUnique({
      where: { id: grantId },
      select: {
        id: true,
        title: true,
        summary: true,
        description: true,
        category: true,
        agency: true,
        amount: true,
        deadline: true,
        url: true,
        industry: true,
        location: true,
      },
    });

    if (!grant) {
      return NextResponse.json(
        { error: "Grant not found" },
        { status: 404 }
      );
    }

    // Placeholder analysis logic
    const analysis = {
      competitiveness: 0.82,
      alignment: 0.74,
      risk: 0.21,
      insights: [
        "Grant aligns moderately with typical nonprofit missions.",
        "Deadline is within a reasonable timeframe.",
        "Funding amount is competitive for similar grants.",
      ],
    };

    return NextResponse.json({
      success: true,
      grant,
      analysis,
    });
  } catch (err: any) {
    console.error("GRANT ANALYZE ERROR:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
