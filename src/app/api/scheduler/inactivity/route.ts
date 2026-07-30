export const dynamic = "force-dynamic";

// app/api/scheduler/inactivity/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



export async function GET() {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30); // 30 days inactivity

    const users = await prisma.user.findMany({
      where: {
        emailVerified: { lt: cutoff }, // ⭐ FIX: only valid DateTime field
      },
    });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("SCHEDULER INACTIVITY ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch inactive users" },
      { status: 500 }
    );
  }
}
