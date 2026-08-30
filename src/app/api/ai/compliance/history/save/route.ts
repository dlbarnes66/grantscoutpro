import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// ==========================================
// POST /api/ai/compliance/history/save
// Saves a new compliance analysis result
// ==========================================
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { grantId, compliance } = await req.json();

    if (!grantId || !compliance) {
      return NextResponse.json(
        { error: "grantId and compliance are required" },
        { status: 400 }
      );
    }

    const entry = await prisma.complianceHistory.create({
      data: {
        userId,
        grantId,
        compliance,
      },
    });

    return NextResponse.json({ success: true, entry });
  } catch (err: any) {
    console.error("AI COMPLIANCE SAVE ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
