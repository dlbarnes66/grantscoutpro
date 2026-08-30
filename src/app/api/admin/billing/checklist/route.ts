import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId || !sessionClaims?.superAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const workspaceId = req.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  }

  const billing = await prisma.workspaceBilling.findUnique({
    where: { workspaceId },
  });

  const addons = await prisma.workspaceAddon.findMany({
    where: { workspaceId },
  });

  return NextResponse.json({
    success: true,
    checklist: {
      billingExists: !!billing,
      addonsCount: addons.length,
      subscriptionActive: billing?.stripeSubscriptionId ? true : false,
      usage: {
        searches: billing?.usageSearches ?? 0,
        uploads: billing?.usageUploads ?? 0,
        members: billing?.usageMembers ?? 0,
        ai: billing?.usageAI ?? 0,
      },
    },
  });
}
