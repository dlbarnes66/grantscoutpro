import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  const { userId, sessionClaims } = await auth();
  if (!userId || !sessionClaims?.superAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const deleted = await prisma.user.deleteMany({
    where: {
      email: null,
      workspaceMembers: { none: {} },
      activities: { none: {} },
    },
  });

  return NextResponse.json({
    success: true,
    deleted: deleted.count,
  });
}
