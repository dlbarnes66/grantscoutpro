import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { sourceOrgId, targetOrgId } = await req.json();

    if (!sourceOrgId || !targetOrgId) {
      return NextResponse.json(
        { error: "Missing sourceOrgId or targetOrgId" },
        { status: 400 }
      );
    }

    await prisma.teamMember.updateMany({
      where: { orgId: sourceOrgId },
      data: { orgId: targetOrgId },
    });

    await prisma.organization.delete({
      where: { id: sourceOrgId },
    });

    return NextResponse.json({ merged: true });
  } catch (err: any) {
    console.error("Org merge error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
