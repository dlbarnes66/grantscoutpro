export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



export async function POST(req: Request) {
  try {
    const { userId, grantId, result } = await req.json();

    if (!userId || !grantId || !result) {
      return NextResponse.json(
        { success: false, error: "Missing userId, grantId, or result" },
        { status: 400 }
      );
    }

    const record = await prisma.renewalHistory.create({
      data: {
        userId,
        grantId,
        status: result,   // ✔ FIXED FIELD NAME
      },
    });

    return NextResponse.json({
      success: true,
      history: record,
    });
  } catch (err: any) {
    console.error("RENEWAL HISTORY SAVE ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
