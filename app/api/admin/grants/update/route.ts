import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { grantId, updates } = await req.json();

    if (!grantId || !updates) {
      return NextResponse.json(
        { error: "Missing grantId or updates" },
        { status: 400 }
      );
    }

    const grant = await prisma.grant.update({
      where: { id: grantId },
      data: updates,
    });

    return NextResponse.json({ grant });
  } catch (err: any) {
    console.error("Grant update error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
