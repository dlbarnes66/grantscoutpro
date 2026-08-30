import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId, sessionClaims } = await auth();
  if (!userId || !sessionClaims?.superAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const users = await prisma.user.count();
    const workspaces = await prisma.workspace.count();
    const grants = await prisma.grant.count();
    const applications = await prisma.application.count();
    const documents = await prisma.document.count();

    return NextResponse.json({
      success: true,
      analytics: {
        users,
        workspaces,
        grants,
        applications,
        documents,
      },
    });
  } catch (err: any) {
    console.error("ADMIN ANALYTICS ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
