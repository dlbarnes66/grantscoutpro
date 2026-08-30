import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId || !sessionClaims?.superAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { sourceOrgId, targetOrgId } = await req.json();

  await prisma.user.updateMany({
    where: { orgId: sourceOrgId },
    data: { orgId: targetOrgId },
  });

  return NextResponse.json({ success: true });
}
