import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pipeline = await prisma.crmLead.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ pipeline });
  } catch (err: any) {
    console.error("CRM pipeline error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
