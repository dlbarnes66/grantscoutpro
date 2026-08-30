import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId || !sessionClaims?.superAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { grantId } = await req.json();
  if (!grantId) {
    return NextResponse.json({ error: "grantId is required" }, { status: 400 });
  }

  await prisma.grant.delete({
    where: { id: grantId },
  });

  return NextResponse.json({ success: true });
}
