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

    const comparison = await prisma.grantComparison.findUnique({
      where: { id: grantId },
      include: {
        activities: true,
        comments: true,
        user: true,
        workspace: true
      }
    });

    if (!comparison) {
      return NextResponse.json(
        { error: "Grant comparison not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, comparison });
  } catch (err: any) {
    console.error("GRANT COMPARISON ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
