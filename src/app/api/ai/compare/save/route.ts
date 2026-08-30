import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// ==========================================
// POST /api/ai/compare/save
// Saves a new comparison result
// ==========================================
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { grantId, comparison } = await req.json();

    if (!grantId || !comparison) {
      return NextResponse.json(
        { error: "grantId and comparison are required" },
        { status: 400 }
      );
    }

    const entry = await prisma.compareHistory.create({
      data: {
        userId,
        grantId,
        comparison,
      },
    });

    return NextResponse.json({ success: true, entry });
  } catch (err: any) {
    console.error("AI COMPARE SAVE ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
