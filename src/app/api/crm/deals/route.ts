import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceRole } from "@/lib/crm/access";
import { isCrmStage } from "@/lib/crm/stages";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/crm/deals?workspaceId=...&stage=lead (stage optional)
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaceId = req.nextUrl.searchParams.get("workspaceId") || "";
  const stage = req.nextUrl.searchParams.get("stage") || undefined;

  const role = await getWorkspaceRole(workspaceId, userId);
  if (!role) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const deals = await prisma.crmDeal.findMany({
      where: { workspaceId, ...(stage ? { stage } : {}) },
      orderBy: { updatedAt: "desc" },
      include: {
        contact: { select: { id: true, name: true, email: true, organization: true } },
        _count: { select: { notes: true } },
      },
    });

    return NextResponse.json({ success: true, deals });
  } catch (err: any) {
    console.error("CRM DEALS GET ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/crm/deals  { workspaceId, title, organization?, contactId?, amount?, stage? }
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const workspaceId = body?.workspaceId as string | undefined;
  const title = typeof body?.title === "string" ? body.title.trim() : "";

  if (!workspaceId) return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 });

  const stage = isCrmStage(body?.stage) ? body.stage : "lead";

  const role = await getWorkspaceRole(workspaceId, userId);
  if (!role) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const deal = await prisma.crmDeal.create({
      data: {
        workspaceId,
        title,
        organization: body?.organization || null,
        contactId: body?.contactId || null,
        amount: typeof body?.amount === "number" ? body.amount : null,
        stage,
        createdById: userId,
      },
    });

    await prisma.crmActivity.create({
      data: {
        workspaceId,
        dealId: deal.id,
        userId,
        type: "deal_created",
        description: `"${deal.title}" was added to the pipeline as ${stage}.`,
      },
    });

    return NextResponse.json({ success: true, deal });
  } catch (err: any) {
    console.error("CRM DEALS POST ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
