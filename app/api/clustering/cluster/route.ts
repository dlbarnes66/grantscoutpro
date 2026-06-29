import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { clusterId } = await req.json();

    if (clusterId === undefined) {
      return NextResponse.json({ error: "Missing clusterId" }, { status: 400 });
    }

    const grants = await prisma.grant.findMany({
      where: { cluster: clusterId },
      orderBy: { deadline: "asc" },
    });

    return NextResponse.json({ grants });
  } catch (err: any) {
    console.error("Cluster fetch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
