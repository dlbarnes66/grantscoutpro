import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { leadId, status } = await req.json();

    if (!leadId || !status) {
      return NextResponse.json(
        { error: "Missing leadId or status" },
        { status: 400 }
      );
    }

    const lead = await prisma.crmLead.update({
      where: { id: leadId },
      data: { status },
    });

    return NextResponse.json({ lead });
  } catch (err: any) {
    console.error("CRM update error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
