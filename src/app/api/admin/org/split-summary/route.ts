import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId || !sessionClaims?.superAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orgId = req.nextUrl.searchParams.get("orgId");

  const workspaces = await prisma.workspace.count({ where: { orgId } });
  const users = await prisma.user.count({ where: { orgId } });

  return NextResponse.json({
    success: true,
    summary: { workspaces, users },
  });
}
