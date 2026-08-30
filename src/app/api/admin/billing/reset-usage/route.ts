import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId || !sessionClaims?.superAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { workspaceId } = await req.json();
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  }

  const updated = await prisma.workspaceBilling.update({
    where: { workspaceId },
    data: {
      usageSearches: 0,
      usageUploads: 0,
      usageMembers: 1,
      usageAI: 0,
    },
  });

  return NextResponse.json({ success: true, billing: updated });
}
