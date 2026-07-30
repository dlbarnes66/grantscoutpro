export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";




export async function GET() {
  try {
    const audits = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" }
    });

    return new Response(JSON.stringify(audits), { status: 200 });
  } catch (error: any) {
    console.error("Audit archive error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
