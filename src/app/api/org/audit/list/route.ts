export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";




export async function POST(req: Request) {
  try {
    const { orgId } = await req.json();

    if (!orgId) {
      return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
    }

    const logs = await prisma.auditLog.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ logs });
  } catch (err: any) {
    console.error("Org audit list error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
