export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";



export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await req.json();

    const { workspaceId, grantIds, name, analysis } = body;

    if (!workspaceId || !grantIds || !Array.isArray(grantIds)) {
      return NextResponse.json(
        { error: "Missing workspaceId or grantIds" },
        { status: 400 }
      );
    }

    // Create comparison using correct Prisma field: grants
    const comparison = await prisma.grantComparison.create({
      data: {
        userId,
        workspaceId,
        grants: grantIds,                 // ✔ correct field
        name: name ?? "Untitled Comparison",
        analysis: analysis ?? null,
      },
    });

    return NextResponse.json({
      success: true,
      comparison,
    });
  } catch (err: any) {
    console.error("GRANT COMPARISON CREATE ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
