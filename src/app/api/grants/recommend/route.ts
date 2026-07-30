import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const workspaceId = body.workspaceId;
    const limit = body.limit ?? 10;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing workspaceId" },
        { status: 400 }
      );
    }

    const grants = await prisma.grant.findMany({
      where: {
        workspaceId,
        status: "ACTIVE"
      },
      select: {
        id: true,
        title: true,
        summary: true,
        description: true,
        category: true,
        agency: true,
        amount: true,
        amountMin: true,
        amountMax: true,
        totalFunding: true,
        deadline: true,
        industry: true,
        location: true,
        // fundingRange removed — not in Prisma model
        status: true,
        embedding: true
      },
      take: limit
    });

    return NextResponse.json({ success: true, grants });
  } catch (err: any) {
    console.error("RECOMMEND GRANTS ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
