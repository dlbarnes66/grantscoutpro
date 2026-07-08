import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const clusters = await prisma.cluster.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ clusters });
  } catch (err: any) {
    console.error("Cluster overview error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
