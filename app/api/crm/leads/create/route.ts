import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { name, email, source } = await req.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Missing name or email" },
        { status: 400 }
      );
    }

    const lead = await prisma.crmLead.create({
      data: {
        name,
        email,
        source: source ?? "unknown",
      },
    });

    return NextResponse.json({ lead });
  } catch (err: any) {
    console.error("CRM lead error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
