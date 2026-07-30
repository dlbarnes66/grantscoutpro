import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await context.params;
    const { email, invitedById } = await request.json();

    if (!email || !invitedById) {
      return NextResponse.json(
        { error: "Missing email or invitedById" },
        { status: 400 }
      );
    }

    const invite = await prisma.workspaceInvite.create({
      data: {
        workspaceId,
        email,
        invitedById
      }
    });

    return NextResponse.json({ success: true, invite });
  } catch (err: any) {
    console.error("WORKSPACE INVITE ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
