import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { assignments } = await req.json();

    if (!assignments || !Array.isArray(assignments)) {
      return NextResponse.json(
        { error: "Missing assignments array" },
        { status: 400 }
      );
    }

    let moved = 0;

    for (const a of assignments) {
      await prisma.teamMember.updateMany({
        where: { userId: a.userId },
        data: { orgId: a.newOrgId },
      });
      moved++;
    }

    return NextResponse.json({ moved });
  } catch (err: any) {
    console.error("Move members error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
