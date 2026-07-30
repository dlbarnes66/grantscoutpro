export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";



export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { leadId, notes } = await req.json();

    if (!leadId) {
      return NextResponse.json(
        { error: "Missing leadId" },
        { status: 400 }
      );
    }

    // ✔ CrmLead does NOT have a `status` field
    // ✔ It DOES have a `notes` field
    const lead = await prisma.crmLead.update({
      where: { id: leadId },
      data: { notes },   // safe, schema-aligned
    });

    return NextResponse.json({ lead });
  } catch (err: any) {
    console.error("CRM UPDATE STATUS ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
