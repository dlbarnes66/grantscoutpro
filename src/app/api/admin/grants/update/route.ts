import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId || !sessionClaims?.superAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { grantId, data } = await req.json();
  if (!grantId || !data) {
    return NextResponse.json({ error: "grantId and data required" }, { status: 400 });
  }

  const updated = await prisma.grant.update({
    where: { id: grantId },
    data,
  });

  return NextResponse.json({ success: true, updated });
}
