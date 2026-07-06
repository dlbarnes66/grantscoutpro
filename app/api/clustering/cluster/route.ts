import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { clusterId } = await req.json();

    if (!clusterId) {
      return NextResponse.json(
        { error: "Missing clusterId" },
        { status: 400 }
      );
    }

    // No cluster field exists on Grant — return all grants for now
    const grants = await prisma.grant.findMany({
      orderBy: { deadline: "asc" },
    });

    return NextResponse.json({ grants });
  } catch (err: any) {
    console.error("Cluster fetch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
