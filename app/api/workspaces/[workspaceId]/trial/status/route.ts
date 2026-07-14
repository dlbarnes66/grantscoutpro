import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceRole } from "@/lib/auth/workspace-permissions";

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    await requireWorkspaceRole(params.workspaceId, ["ADMIN", "MEMBER"]);

    const workspace = await prisma.workspace.findUnique({
      where: { id: params.workspaceId },
      select: {
        trialStart: true,
        trialEnd: true,
        trialActive: true,
        trialLocked: true,
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    return NextResponse.json(workspace);
  } catch (error: any) {
    console.error("Trial status error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
