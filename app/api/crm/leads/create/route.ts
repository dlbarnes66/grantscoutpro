import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { name, email, phone, notes } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Missing name" },
        { status: 400 }
      );
    }

    const lead = await prisma.crmLead.create({
      data: {
        name,
        email,
        phone,
        notes,
      },
    });

    return NextResponse.json({ lead });
  } catch (err: any) {
    console.error("CRM lead creation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
