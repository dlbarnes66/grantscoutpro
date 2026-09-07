import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceRole } from "@/lib/crm/access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/crm/contacts?workspaceId=...
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaceId = req.nextUrl.searchParams.get("workspaceId") || "";
  const role = await getWorkspaceRole(workspaceId, userId);
  if (!role) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const contacts = await prisma.crmContact.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { deals: true, notes: true } } },
    });

    return NextResponse.json({ success: true, contacts });
  } catch (err: any) {
    console.error("CRM CONTACTS GET ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/crm/contacts  { workspaceId, name, email?, phone?, organization?, title? }
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const workspaceId = body?.workspaceId as string | undefined;
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!workspaceId) return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const role = await getWorkspaceRole(workspaceId, userId);
  if (!role) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const contact = await prisma.crmContact.create({
      data: {
        workspaceId,
        name,
        email: body?.email || null,
        phone: body?.phone || null,
        organization: body?.organization || null,
        title: body?.title || null,
        createdById: userId,
      },
    });

    return NextResponse.json({ success: true, contact });
  } catch (err: any) {
    console.error("CRM CONTACTS POST ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
