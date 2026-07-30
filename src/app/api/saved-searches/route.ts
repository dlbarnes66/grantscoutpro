export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";



export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Find workspace owned by the user
    let workspace = await prisma.workspace.findFirst({
      where: { ownerId: userId },
    });

    // If none, find workspace where user is a member
    if (!workspace) {
      const membership = await prisma.workspaceMember.findFirst({
        where: { userId },
        include: { workspace: true },
      });

      workspace = membership?.workspace ?? null;
    }

    if (!workspace) {
      return NextResponse.json(
        { error: "No workspace found for user" },
        { status: 404 }
      );
    }

    // Fetch saved searches for this user
    const savedSearches = await prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      savedSearches,
    });
  } catch (err: any) {
    console.error("SAVED SEARCHES LIST ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
