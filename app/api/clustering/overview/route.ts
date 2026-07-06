import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // No cluster field exists on Grant — return basic overview instead
    const grants = await prisma.grant.findMany({
      orderBy: { deadline: "asc" },
    });

    return NextResponse.json({
      clusters: [],
      totalGrants: grants.length,
      grants,
    });
  } catch (err: any) {
    console.error("Cluster overview error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
