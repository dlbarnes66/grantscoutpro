import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId, orgId } = await req.json();

    if (!userId || !orgId) {
      return NextResponse.json(
        { error: "Missing userId or orgId" },
        { status: 400 }
      );
    }

    const member = await prisma.teamMember.findFirst({
      where: { userId, orgId },
    });

    return NextResponse.json({ allowed: !!member });
  } catch (err: any) {
    console.error("Strict isolation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
