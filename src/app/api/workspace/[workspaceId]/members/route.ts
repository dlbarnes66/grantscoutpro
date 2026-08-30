import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { workspaceId } = params;

    await requireWorkspaceMember(workspaceId);

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: true },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Members route error:", error);
    return NextResponse.json(
      { error: "Failed to load members." },
      { status: 500 }
    );
  }
}
