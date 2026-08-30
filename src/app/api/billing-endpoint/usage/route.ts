import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const workspace = await prisma.workspace.findFirst({
      where: { orgId },
      include: {
        billing: true,
      },
    });

    if (!workspace || !workspace.billing) {
      return NextResponse.json(
        { error: "Workspace or billing not found" },
        { status: 404 }
      );
    }

    const billing = workspace.billing;

    return NextResponse.json({
      usage: {
        searches: billing.usageSearches,
        uploads: billing.usageUploads,
        members: billing.usageMembers,
        ai: billing.usageAI,
      },
      limits: {
        documentLimit: billing.documentLimit,
        storageLimitMb: billing.storageLimitMb,
        aiTokensMonthly: billing.aiTokensMonthly,
        seats: billing.seats,
      },
    });
  } catch (err) {
    console.error("USAGE ROUTE ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
