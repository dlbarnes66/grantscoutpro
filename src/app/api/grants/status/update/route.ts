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

    const { grantId, status, notes, priority } = await request.json();

    if (!grantId || !status) {
      return NextResponse.json(
        { error: "Missing grantId or status" },
        { status: 400 }
      );
    }

    // Load existing grant
    const grant = await prisma.grant.findUnique({
      where: { id: grantId },
    });

    if (!grant) {
      return NextResponse.json(
        { error: "Grant not found" },
        { status: 404 }
      );
    }

    // Ensure raw is a safe object
    const existingRaw =
      grant.raw && typeof grant.raw === "object" && !Array.isArray(grant.raw)
        ? grant.raw
        : {};

    // Ensure statusHistory is a safe array
    const history = Array.isArray(existingRaw.statusHistory)
      ? existingRaw.statusHistory
      : [];

    // Build updated raw metadata
    const updatedRaw = {
      ...existingRaw,
      notes: notes ?? null,
      priority: priority ?? null,
      statusHistory: [
        ...history,
        `${new Date().toISOString()} — Status changed to: ${status}`,
      ],
    };

    // Update grant safely
    const updated = await prisma.grant.update({
      where: { id: grantId },
      data: {
        status,
        raw: updatedRaw,
      },
    });

    return NextResponse.json({
      success: true,
      grant: updated,
    });
  } catch (err: any) {
    console.error("GRANT STATUS UPDATE ERROR:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
