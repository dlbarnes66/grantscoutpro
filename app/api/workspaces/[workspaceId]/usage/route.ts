import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceAccess } from "@/lib/auth/workspace-permissions";
import { initBilling } from "@/lib/billing/initBilling";

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    await requireWorkspaceAccess(params.workspaceId);

    const billing = await initBilling(params.workspaceId);

    return NextResponse.json({
      usage: {
        searches: billing.usageSearches,
        uploads: billing.usageUploads,
        members: billing.usageMembers,
        ai: billing.usageAI,
      },
      plan: billing.plan,
    });
  } catch (error: any) {
    console.error("Usage fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
