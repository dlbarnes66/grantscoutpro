import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    // Auth (NextAuth v5)
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { grantId } = await req.json();

    const grant = await prisma.grant.findUnique({
      where: { id: grantId },
    });

    if (!grant) {
      return NextResponse.json({ error: "Grant not found" }, { status: 404 });
    }

    // Create comparison record — FIXED: use `grants` JSON field
    const comparison = await prisma.grantComparison.create({
      data: {
        userId,
        workspaceId: grant.workspaceId,
        grants: [grant.id], // JSON array of IDs
      },
    });

    return NextResponse.json({ comparisonId: comparison.id });
  } catch (err) {
    console.error("Compare error:", err);
    return NextResponse.json(
      { error: "Failed to create comparison" },
      { status: 500 }
    );
  }
}
