import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceAccess } from "@/lib/auth/workspace-permissions";
import { initBilling } from "@/lib/billing/initBilling";

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    await requireWorkspaceAccess(params.workspaceId);

    const billing = await initBilling(params.workspaceId);

    return NextResponse.json({ billing });
  } catch (error: any) {
    console.error("Billing fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    await requireWorkspaceAccess(params.workspaceId);

    const data = await req.json();

    const updated = await prisma.workspaceBilling.update({
      where: { workspaceId: params.workspaceId },
      data,
    });

    return NextResponse.json({ billing: updated });
  } catch (error: any) {
    console.error("Billing update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
