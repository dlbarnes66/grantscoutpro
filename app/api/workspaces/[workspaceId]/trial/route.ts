import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceRole } from "@/lib/auth/workspace-permissions";

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    await requireWorkspaceRole(params.workspaceId, ["ADMIN"]);

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const invite = await prisma.workspaceInvite.create({
      data: {
        workspaceId: params.workspaceId,
        email,
        invitedById: null,
        status: "pending",
      },
    });

    return NextResponse.json(invite);
  } catch (error: any) {
    console.error("Trial invite error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
