import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId || !sessionClaims?.superAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { orgId, newOrgName } = await req.json();

  const newOrg = await prisma.org.create({
    data: { name: newOrgName },
  });

  await prisma.workspace.updateMany({
    where: { orgId },
    data: { orgId: newOrg.id },
  });

  return NextResponse.json({ success: true, newOrg });
}
