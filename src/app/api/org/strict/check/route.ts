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
    const { workspaceId } = await req.json();

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing workspaceId" },
        { status: 400 }
      );
    }

    // Strict membership check using correct Prisma fields
    const member = await prisma.workspaceMember.findFirst({
      where: { userId, workspaceId },
    });

    if (!member) {
      return NextResponse.json(
        {
          allowed: false,
          reason: "User is not a member of this workspace",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      allowed: true,
      role: member.role,
    });
  } catch (err: any) {
    console.error("ORG STRICT CHECK ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
