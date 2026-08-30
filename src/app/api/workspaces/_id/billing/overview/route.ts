import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

export async function GET(
  _req: Request,
  { params }: { params: Params }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.id },
      include: {
        billing: true,
        addonBillings: true,
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const isOwner = workspace.ownerId === userId;
    const isAdmin = await prisma.workspaceMember.findFirst({
      where: { workspaceId: params.id, userId, role: "admin" },
    });

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const billing = workspace.billing;

    const overview = {
      plan: billing.plan,
      stripeCustomerId: billing.stripeCustomerId,
      stripeSubscriptionId: billing.stripeSubscriptionId,
      renewalDate: workspace.billingRenewalDate,
      usage: {
        searches: billing.usageSearches,
        uploads: billing.usageUploads,
        members: billing.usageMembers,
        ai: billing.usageAI,
      },
      limits: {
        seats: billing.seats,
        aiTokensMonthly: billing.aiTokensMonthly,
        documentLimit: billing.documentLimit,
        storageLimitMb: billing.storageLimitMb,
      },
      addons: workspace.addonBillings,
    };

    return NextResponse.json({ success: true, overview });
  } catch (err: any) {
    console.error("WORKSPACE BILLING OVERVIEW ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
