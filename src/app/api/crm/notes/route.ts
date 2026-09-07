import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceRole } from "@/lib/crm/access";
import { hasCrmAccess } from "@/lib/crm/entitlement";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/crm/notes?workspaceId=...&dealId=...  (or &contactId=...)
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaceId = req.nextUrl.searchParams.get("workspaceId") || "";
  const dealId = req.nextUrl.searchParams.get("dealId") || undefined;
  const contactId = req.nextUrl.searchParams.get("contactId") || undefined;

  if (!dealId && !contactId) {
    return NextResponse.json({ error: "dealId or contactId is required" }, { status: 400 });
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
    const notes = await prisma.crmNote.findMany({
      where: { workspaceId, ...(dealId ? { dealId } : {}), ...(contactId ? { contactId } : {}) },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, notes });
  } catch (err: any) {
    console.error("CRM NOTES GET ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/crm/notes  { workspaceId, dealId?, contactId?, body }
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const workspaceId = body?.workspaceId as string | undefined;
  const dealId = body?.dealId as string | undefined;
  const contactId = body?.contactId as string | undefined;
  const text = typeof body?.body === "string" ? body.body.trim() : "";

  if (!workspaceId) return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  if (!dealId && !contactId) {
    return NextResponse.json({ error: "dealId or contactId is required" }, { status: 400 });
  }
  if (!text) return NextResponse.json({ error: "body is required" }, { status: 400 });

  const role = await getWorkspaceRole(workspaceId, userId);
  if (!role) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!(await hasCrmAccess(workspaceId))) {
    return NextResponse.json(
      { error: "CRM isn't included in this workspace's plan. Upgrade to Enterprise or add the CRM addon.", upgrade: true },
      { status: 402 }
    );
  }

  try {
    const note = await prisma.crmNote.create({
      data: { workspaceId, dealId: dealId || null, contactId: contactId || null, authorId: userId, body: text },
    });

    if (dealId) {
      await prisma.crmActivity.create({
        data: {
          workspaceId,
          dealId,
          userId,
          type: "note_added",
          description: "A note was added.",
        },
      });
    }

    return NextResponse.json({ success: true, note });
  } catch (err: any) {
    console.error("CRM NOTES POST ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
