export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



export async function POST(req: Request) {
  try {
    const { userId, grantId, result } = await req.json();

    if (!userId || !result) {
      return NextResponse.json(
        { success: false, error: "Missing userId or result" },
        { status: 400 }
      );
    }

    const record = await prisma.portfolioOptimization.create({
      data: {
        userId,
        grantId: grantId ?? null,
        details: result,     // ✔ FIXED FIELD NAME
      },
    });

    return NextResponse.json({
      success: true,
      optimization: record,
    });
  } catch (err: any) {
    console.error("PORTFOLIO SAVE ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
