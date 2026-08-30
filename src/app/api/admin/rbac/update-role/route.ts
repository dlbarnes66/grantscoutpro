import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId || !sessionClaims?.superAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { targetUserId, role } = await req.json();
  if (!targetUserId || !role) {
    return NextResponse.json({ error: "targetUserId and role are required" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: { role },
  });

  return NextResponse.json({ success: true, updated });
}
