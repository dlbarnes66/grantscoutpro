import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/nextauth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest, context: { params: Record<string, string> }) {
  const { params } = context;
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: No user session" },
        { status: 401 }
      );
    }

    const { grantId, content } = await req.json();

    if (!grantId || !content) {
      return NextResponse.json(
        { error: "Missing grantId or content" },
        { status: 400 }
      );
    }

    // Ensure the grant exists
    const grant = await prisma.grant.findUnique({
      where: { id: grantId },
    });

    if (!grant) {
      return NextResponse.json(
        { error: "Grant not found" },
        { status: 404 }
      );
    }

    // STEP 1: Find the comparison containing this grantId
    const comparison = await prisma.grantComparison.findFirst({
      where: {
        // JSON array contains grantId
        grants: grantId,
      },
    });

    if (!comparison) {
      return NextResponse.json(
        { error: "No comparison contains this grant" },
        { status: 404 }
      );
    }

    // STEP 2: Update the analysis field
    const updated = await prisma.grantComparison.update({
      where: { id: comparison.id },
      data: {
        analysis: content,
      },
    });

    return NextResponse.json({
      success: true,
      updated,
    });
  } catch (err: any) {
    console.error("GRANT WRITE ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
