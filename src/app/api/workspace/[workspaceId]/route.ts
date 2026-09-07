import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/auth";

export async function GET(
  req: Request,
  context: { params: Promise<{ workspaceId: string }> }
) {
  const params = await context.params;
  try {
    const { workspaceId } = params;

    await requireWorkspaceMember(workspaceId);

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: {
          include: { user: true },
        },
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    }

    return NextResponse.json(workspace);
  } catch (error) {
    console.error("Workspace route error:", error);
    return NextResponse.json(
      { error: "Failed to load workspace." },
      { status: 500 }
    );
  }
}
