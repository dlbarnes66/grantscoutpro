import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const workspaceId = session.user.workspaceId;

    // FIX: WorkspaceInvite requires invitedBy
    const invite = await prisma.workspaceInvite.create({
      data: {
        email,
        status: "pending",
        invitedBy: session.user.id, // REQUIRED FIELD
        workspace: {
          connect: { id: workspaceId }, // RELATION CONNECT
        },
      },
    });

    return NextResponse.json({ ok: true, invite });
  } catch (err) {
    console.error("Invite error:", err);
    return NextResponse.json(
      { error: "Failed to send invite" },
      { status: 500 }
    );
  }
}
