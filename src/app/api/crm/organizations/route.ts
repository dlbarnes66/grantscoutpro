import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceRole } from "@/lib/crm/access";
import { hasCrmAccess } from "@/lib/crm/entitlement";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/crm/organizations?workspaceId=...
// There's no standalone "organization" entity - this returns the distinct
// organization names already on file across contacts and deals, for
// autocomplete when adding a new contact or deal.
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
    const [contacts, deals] = await Promise.all([
      prisma.crmContact.findMany({
        where: { workspaceId, organization: { not: null } },
        select: { organization: true },
        distinct: ["organization"],
      }),
      prisma.crmDeal.findMany({
        where: { workspaceId, organization: { not: null } },
        select: { organization: true },
        distinct: ["organization"],
      }),
    ]);

    const names = Array.from(
      new Set(
        [...contacts, ...deals]
          .map((r) => r.organization)
          .filter((n): n is string => !!n)
      )
    ).sort((a, b) => a.localeCompare(b));

    return NextResponse.json({ success: true, organizations: names });
  } catch (err: any) {
    console.error("CRM ORGANIZATIONS GET ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
