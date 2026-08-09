import { NextRequest, NextResponse } from "next/server";
// app/dashboard/grant-compare/route.ts
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/nextauth";

export const runtime = "nodejs";

export async function POST(req: NextRequest, context: { params: Record<string, string> }) {
  const { params } = context;
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { workspaceId, grantIds } = await req.json();

    if (!workspaceId || !grantIds || !Array.isArray(grantIds)) {
      return NextResponse.json(
        { success: false, error: "Missing workspaceId or grantIds[]" },
        { status: 400 }
      );
    }

    const comparison = await prisma.grantComparison.create({
      data: {
        userId,
        workspaceId,
        grants: grantIds, // ⭐ JSON array (correct field)
        name: "Untitled Comparison",
      },
    });

    return NextResponse.json({ success: true, comparison });
  } catch (error) {
    console.error("GRANT COMPARE ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create comparison" },
      { status: 500 }
    );
  }
}
