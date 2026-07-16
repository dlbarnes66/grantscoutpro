import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.workspaceId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name } = await req.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Workspace name is required" },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.update({
      where: { id: session.user.workspaceId },
      data: { name },
    });

    return NextResponse.json({ ok: true, workspace });
  } catch (err) {
    console.error("Workspace name update error:", err);
    return NextResponse.json(
      { error: "Failed to update workspace name" },
      { status: 500 }
    );
  }
}
