import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceRole } from "@/lib/crm/access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// POST /api/crm/leads/create  { workspaceId, name, email?, organization? }
// Convenience wrapper: creates a CrmDeal at stage "lead", optionally
// creating/linking a CrmContact by email so the lead has a real person
// attached to it from the start.
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const workspaceId = body?.workspaceId as string | undefined;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const organization = typeof body?.organization === "string" ? body.organization.trim() : "";

  if (!workspaceId) return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const role = await getWorkspaceRole(workspaceId, userId);
  if (!role) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    let contact = null;
    if (email) {
      contact = await prisma.crmContact.findFirst({ where: { workspaceId, email } });
    }
    if (!contact) {
      contact = await prisma.crmContact.create({
        data: {
          workspaceId,
          name,
          email: email || null,
          organization: organization || null,
          createdById: userId,
        },
      });
    }

    const deal = await prisma.crmDeal.create({
      data: {
        workspaceId,
        title: organization ? `${organization} - ${name}` : name,
        organization: organization || null,
        contactId: contact.id,
        stage: "lead",
        createdById: userId,
      },
    });

    await prisma.crmActivity.create({
      data: {
        workspaceId,
        dealId: deal.id,
        userId,
        type: "deal_created",
        description: `New lead "${deal.title}" added.`,
      },
    });

    return NextResponse.json({ success: true, lead: deal, contact });
  } catch (err: any) {
    console.error("CRM LEADS CREATE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
