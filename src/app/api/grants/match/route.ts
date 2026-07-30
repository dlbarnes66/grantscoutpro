export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { filters } = await request.json();

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

    // Build dynamic grant filters
    const where: any = {
      workspaceId: workspace.id,
    };

    if (filters?.category) where.category = filters.category;
    if (filters?.industry) where.industry = filters.industry;
    if (filters?.location) where.location = filters.location;
    if (filters?.agency) where.agency = filters.agency;

    // Fetch matching grants
    const grants = await prisma.grant.findMany({
      where,
      orderBy: { deadline: "asc" },
    });

    return NextResponse.json({
      success: true,
      grants,
    });
  } catch (err: any) {
    console.error("GRANT MATCH ERROR:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
