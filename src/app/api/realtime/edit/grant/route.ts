import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { grantId, workspaceId, updates } = await req.json();

    if (!grantId || !workspaceId || !updates) {
      return NextResponse.json(
        { error: "grantId, workspaceId, and updates are required" },
        { status: 400 }
      );
    }

    // Validate grant exists
    const grant = await prisma.grant.findUnique({
      where: { id: grantId },
    });

    if (!grant) {
      return NextResponse.json({ error: "Grant not found" }, { status: 404 });
    }

    // Apply updates
    const updated = await prisma.grant.update({
      where: { id: grantId },
      data: updates,
    });

    // Broadcast to workspace
    console.log("Broadcast grant update:", {
      grantId,
      workspaceId,
      userId,
      updates,
    });

    return NextResponse.json({ success: true, grant: updated });
  } catch (err: any) {
    console.error("GRANT EDIT ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
