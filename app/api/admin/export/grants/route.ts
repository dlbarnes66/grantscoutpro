import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const grants = await prisma.grant.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ grants });
  } catch (err: any) {
    console.error("Export grants error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
