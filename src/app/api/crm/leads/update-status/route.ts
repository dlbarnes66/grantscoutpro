import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceRole } from "@/lib/crm/access";
import { hasCrmAccess } from "@/lib/crm/entitlement";
import { isCrmStage, stageLabel } from "@/lib/crm/stages";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// POST /api/crm/leads/update-status  { workspaceId, dealId, stage }
// Convenience wrapper around PATCH /api/crm/deals/[id] for moving a deal
// to a new pipeline stage.
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const workspaceId = body?.workspaceId as string | undefined;
  const dealId = body?.dealId as string | undefined;
  const stage = body?.stage;

  if (!workspaceId || !dealId) {
    return NextResponse.json({ error: "workspaceId and dealId are required" }, { status: 400 });
  }
  if (!isCrmStage(stage)) {
    return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
  }

  const role = await getWorkspaceRole(workspaceId, userId);
  if (!role) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!(await hasCrmAccess(workspaceId))) {
    return NextResponse.json(
      { error: "CRM isn't included in this workspace's plan. Upgrade to Enterprise or add the CRM addon.", upgrade: true },
      { status: 402 }
    );
  }

  try {
    const existing = await prisma.crmDeal.findUnique({ where: { id: dealId } });
    if (!existing || existing.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.crmDeal.update({ where: { id: dealId }, data: { stage } });

    if (stage !== existing.stage) {
      await prisma.crmActivity.create({
        data: {
          workspaceId,
          dealId,
          userId,
          type: "stage_changed",
          description: `"${updated.title}" moved from ${stageLabel(existing.stage)} to ${stageLabel(stage)}.`,
        },
      });
    }

    return NextResponse.json({ success: true, deal: updated });
  } catch (err: any) {
    console.error("CRM LEADS UPDATE-STATUS ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
