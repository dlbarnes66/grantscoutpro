import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { grantId, status } = await req.json().catch(() => ({}));

    if (!grantId || !status) {
      return NextResponse.json(
        { error: "Missing grantId or status" },
        { status: 400 }
      );
    }

    const updated = await prisma.grant.update({
      where: { id: grantId },
      data: { status },
    });

    return NextResponse.json({ success: true, grant: updated });
  } catch (err: any) {
    console.error("GRANTS STATUS UPDATE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
