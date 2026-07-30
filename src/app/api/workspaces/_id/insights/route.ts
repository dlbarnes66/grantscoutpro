export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    // WorkspaceInsight does NOT contain workspaceId or workspace relation.
    // So we fetch global insights instead.
    const insights = await prisma.workspaceInsight.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      insights,
    });
  } catch (err: any) {
    console.error("WORKSPACE INSIGHTS ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
