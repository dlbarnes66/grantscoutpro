// app/api/workspace/[workspaceId]/admin/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: { workspaceId: string } }) {
  try {
    const workspaceId = params.workspaceId;

    // ⭐ FIXED: WorkspaceMember is the correct model
    const users = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: true },
    });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("ADMIN WORKSPACE ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load workspace users" },
      { status: 500 }
    );
  }
}
