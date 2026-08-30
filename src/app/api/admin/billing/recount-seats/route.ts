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

  const memberCount = await prisma.workspaceMember.count({
    where: { workspaceId },
  });

  const updated = await prisma.workspace.update({
    where: { id: workspaceId },
    data: { currentSeats: memberCount },
  });

  return NextResponse.json({ success: true, seats: updated.currentSeats });
}
