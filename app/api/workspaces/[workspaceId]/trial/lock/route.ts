import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceRole } from "@/lib/auth/workspace-permissions";

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    await requireWorkspaceRole(params.workspaceId, ["ADMIN"]);

    const workspace = await prisma.workspace.update({
      where: { id: params.workspaceId },
      data: {
        trialLocked: true,
        trialActive: false,
      },
    });

    return NextResponse.json(workspace);
  } catch (error: any) {
    console.error("Trial lock error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
