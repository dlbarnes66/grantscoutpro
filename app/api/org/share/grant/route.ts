import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { sharedId, targetOrgId } = await req.json();

    if (!sharedId || !targetOrgId) {
      return NextResponse.json(
        { error: "Missing sharedId or targetOrgId" },
        { status: 400 }
      );
    }

    const access = await prisma.sharedAccess.create({
      data: {
        sharedId,
        orgId: targetOrgId,
      },
    });

    return NextResponse.json({ access });
  } catch (err: any) {
    console.error("Grant access error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
