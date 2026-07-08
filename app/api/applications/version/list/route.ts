import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const versions = await prisma.applicationVersion.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ versions });
  } catch (err: any) {
    console.error("Application version list error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
