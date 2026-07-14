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

    const addon = await prisma.workspaceAddon.upsert({
      where: {
        workspaceId_type: {
          workspaceId: params.workspaceId,
          type: addonType,
        },
      },
      update: { active: true },
      create: {
        workspaceId: params.workspaceId,
        type: addonType,
        active: true,
      },
    });

    return NextResponse.json({ success: true, addon });
  } catch (error: any) {
    console.error("Addon activation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
