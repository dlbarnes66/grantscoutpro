import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceRole } from "@/lib/crm/access";
import { CRM_STAGES } from "@/lib/crm/stages";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/crm/pipeline?workspaceId=...
// Returns every deal in the workspace, grouped by stage, in the funnel
// order the board renders columns in.
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaceId = req.nextUrl.searchParams.get("workspaceId") || "";
  const role = await getWorkspaceRole(workspaceId, userId);
  if (!role) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const deals = await prisma.crmDeal.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: "desc" },
      include: {
        contact: { select: { id: true, name: true, organization: true } },
        _count: { select: { notes: true } },
      },
    });

    const columns = CRM_STAGES.map((stage) => ({
      id: stage.id,
      label: stage.label,
      deals: deals.filter((d) => d.stage === stage.id),
    }));

    return NextResponse.json({ success: true, columns });
  } catch (err: any) {
    console.error("CRM PIPELINE GET ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
