import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceRole } from "@/lib/crm/access";
import { hasCrmAccess } from "@/lib/crm/entitlement";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/crm/leads?workspaceId=...
// A "lead" is just a CrmDeal sitting at the top of the funnel (stage =
// "lead") - this is a thin, read-only view over the same deals table used
// by /api/crm/deals and /api/crm/pipeline, not a separate concept.
export async function GET(req: NextRequest) {
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
    const leads = await prisma.crmDeal.findMany({
      where: { workspaceId, stage: "lead" },
      orderBy: { createdAt: "desc" },
      include: { contact: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ success: true, leads });
  } catch (err: any) {
    console.error("CRM LEADS GET ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
