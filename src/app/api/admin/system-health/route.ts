import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId, sessionClaims } = await auth();
  if (!userId || !sessionClaims?.superAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.count();
  const workspaces = await prisma.workspace.count();
  const grants = await prisma.grant.count();

  return NextResponse.json({
    success: true,
    health: {
      users,
      workspaces,
      grants,
      status: "ok",
      timestamp: new Date().toISOString(),
    },
  });
}
