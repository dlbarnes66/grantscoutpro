import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId, grantId, result } = await req.json();

    if (!userId || !grantId || !result) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const entry = await prisma.eligibilityHistory.create({
      data: {
        userId,
        grantId,
        result,
      },
    });

    return NextResponse.json({ saved: true, entry });
  } catch (err: any) {
    console.error("Eligibility save error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
