export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



export async function POST(req: Request) {
  try {
    const { orgId, userId, action, details } = await req.json();

    if (!action) {
      return NextResponse.json(
        { success: false, error: "Missing action" },
        { status: 400 }
      );
    }

    const record = await prisma.auditLog.create({
      data: {
        orgId: orgId ?? null,
        userId: userId ?? null,
        action,
        metadata: details,   // ✔ FIXED FIELD NAME
      },
    });

    return NextResponse.json({
      success: true,
      log: record,
    });
  } catch (err: any) {
    console.error("AUDIT WRITE ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
