import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceRole } from "@/lib/crm/access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/crm/activity?workspaceId=...&dealId=... (dealId optional)
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaceId = req.nextUrl.searchParams.get("workspaceId") || "";
  const dealId = req.nextUrl.searchParams.get("dealId") || undefined;

  const role = await getWorkspaceRole(workspaceId, userId);
  if (!role) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const activity = await prisma.crmActivity.findMany({
      where: { workspaceId, ...(dealId ? { dealId } : {}) },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, activity });
  } catch (err: any) {
    console.error("CRM ACTIVITY GET ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
