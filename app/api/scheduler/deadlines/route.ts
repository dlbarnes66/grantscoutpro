// app/api/scheduler/deadlines/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const grants = await prisma.grant.findMany({
      where: {
        deadline: {
          not: null,
        },
      },
      orderBy: {
        deadline: "asc",
      },
      // ⭐ FIX: Remove invalid include
      // If you later want saved grants, we will add the correct relation
    });

    return NextResponse.json({
      success: true,
      grants,
    });
  } catch (error) {
    console.error("SCHEDULER DEADLINES ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch deadlines" },
      { status: 500 }
    );
  }
}
