export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";



export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch full user from DB
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const superadminEmail = process.env.SUPERADMIN_EMAIL;

    if (!superadminEmail || user.email !== superadminEmail) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Your schema contains: User, Workspace, Document
    // It does NOT contain: aiRequest
    const totalUsers = await prisma.user.count();
    const activeWorkspaces = await prisma.workspace.count();
    const documents = await prisma.document.count();

    // AI usage table does NOT exist — return zero
    const aiRequests = 0;

    return NextResponse.json({
      success: true,
      analytics: {
        totalUsers,
        activeWorkspaces,
        documents,
        aiRequests,
      },
    });
  } catch (err: any) {
    console.error("PLATFORM ANALYTICS ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
