import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { orgId, settings } = await req.json();

    if (!orgId || !settings) {
      return NextResponse.json(
        { error: "Missing orgId or settings" },
        { status: 400 }
      );
    }

    await prisma.organization.update({
      where: { id: orgId },
      data: { settings },
    });

    return NextResponse.json({ updated: true });
  } catch (err: any) {
    console.error("Org update error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
