import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceRole } from "@/lib/auth/workspace-permissions";

export async function POST(req: Request, { params }) {
  try {
    await requireWorkspaceRole(params.workspaceId, ["ADMIN"]);

    const { addonType } = await req.json();
    if (!addonType) {
      return NextResponse.json({ error: "addonType required" }, { status: 400 });
    }

    await prisma.workspaceAddon.updateMany({
      where: {
        workspaceId: params.workspaceId,
        type: addonType,
      },
      data: { active: false },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Addon deactivation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
