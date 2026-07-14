import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceRole } from "@/lib/auth/workspace-permissions";

export async function GET(req: Request, { params }) {
  try {
    await requireWorkspaceRole(params.workspaceId, ["ADMIN", "MEMBER"]);

    const addons = await prisma.workspaceAddon.findMany({
      where: { workspaceId: params.workspaceId },
    });

    return NextResponse.json({ addons });
  } catch (error: any) {
    console.error("Addon status error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
