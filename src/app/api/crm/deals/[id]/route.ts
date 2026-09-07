import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceRole } from "@/lib/crm/access";
import { hasCrmAccess } from "@/lib/crm/entitlement";
import { isCrmStage, stageLabel } from "@/lib/crm/stages";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

// GET /api/crm/deals/[id]?workspaceId=... -> full deal with notes + activity
export async function GET(req: NextRequest, context: { params: Promise<Params> }) {
  const { id } = await context.params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaceId = req.nextUrl.searchParams.get("workspaceId") || "";
  const role = await getWorkspaceRole(workspaceId, userId);
  if (!role) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!(await hasCrmAccess(workspaceId))) {
    return NextResponse.json(
      { error: "CRM isn't included in this workspace's plan. Upgrade to Enterprise or add the CRM addon.", upgrade: true },
      { status: 402 }
    );
  }

  try {
    const deal = await prisma.crmDeal.findUnique({
      where: { id },
      include: {
        contact: true,
        notes: { orderBy: { createdAt: "desc" } },
        activity: { orderBy: { createdAt: "desc" }, take: 25 },
      },
    });

    if (!deal || deal.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, deal });
  } catch (err: any) {
    console.error("CRM DEAL GET ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/crm/deals/[id]  { workspaceId, stage?, title?, organization?, amount?, contactId? }
export async function PATCH(req: NextRequest, context: { params: Promise<Params> }) {
  const { id } = await context.params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const workspaceId = body?.workspaceId as string | undefined;
  if (!workspaceId) return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });

  const role = await getWorkspaceRole(workspaceId, userId);
  if (!role) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!(await hasCrmAccess(workspaceId))) {
    return NextResponse.json(
      { error: "CRM isn't included in this workspace's plan. Upgrade to Enterprise or add the CRM addon.", upgrade: true },
      { status: 402 }
    );
  }

  try {
    const existing = await prisma.crmDeal.findUnique({ where: { id } });
    if (!existing || existing.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (body.stage !== undefined && !isCrmStage(body.stage)) {
      return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
    }

    const updated = await prisma.crmDeal.update({
      where: { id },
      data: {
        ...(typeof body.title === "string" ? { title: body.title.trim() } : {}),
        ...(body.organization !== undefined ? { organization: body.organization || null } : {}),
        ...(body.amount !== undefined ? { amount: typeof body.amount === "number" ? body.amount : null } : {}),
        ...(body.contactId !== undefined ? { contactId: body.contactId || null } : {}),
        ...(body.stage !== undefined ? { stage: body.stage } : {}),
      },
    });

    if (body.stage !== undefined && body.stage !== existing.stage) {
      await prisma.crmActivity.create({
        data: {
          workspaceId,
          dealId: id,
          userId,
          type: "stage_changed",
          description: `"${updated.title}" moved from ${stageLabel(existing.stage)} to ${stageLabel(updated.stage)}.`,
        },
      });
    }

    return NextResponse.json({ success: true, deal: updated });
  } catch (err: any) {
    console.error("CRM DEAL PATCH ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/crm/deals/[id]  { workspaceId }
export async function DELETE(req: NextRequest, context: { params: Promise<Params> }) {
  const { id } = await context.params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const workspaceId = body?.workspaceId as string | undefined;
  if (!workspaceId) return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });

  const role = await getWorkspaceRole(workspaceId, userId);
  if (!role) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!(await hasCrmAccess(workspaceId))) {
    return NextResponse.json(
      { error: "CRM isn't included in this workspace's plan. Upgrade to Enterprise or add the CRM addon.", upgrade: true },
      { status: 402 }
    );
  }

  try {
    const existing = await prisma.crmDeal.findUnique({ where: { id } });
    if (!existing || existing.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.crmDeal.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("CRM DEAL DELETE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
