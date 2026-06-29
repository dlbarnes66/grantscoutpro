import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const apps = await prisma.application.findMany({
      include: {
        user: true,
        grant: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ applications: apps });
  } catch (err: any) {
    console.error("Export applications error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
