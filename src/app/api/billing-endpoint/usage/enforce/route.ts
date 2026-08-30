import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { type } = body as { type: "search" | "upload" | "ai" | "member" };

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

    let allowed = true;
    let reason: string | null = null;

    switch (type) {
      case "search":
        if (billing.usageSearches >= billing.documentLimit) {
          allowed = false;
          reason = "Search limit reached";
        }
        break;
      case "upload":
        if (billing.usageUploads >= billing.storageLimitMb) {
          allowed = false;
          reason = "Storage limit reached";
        }
        break;
      case "ai":
        if (billing.aiTokensUsed >= billing.aiTokensMonthly) {
          allowed = false;
          reason = "AI token limit reached";
        }
        break;
      case "member":
        if (billing.usageMembers >= billing.seats) {
          allowed = false;
          reason = "Seat limit reached";
        }
        break;
      default:
        allowed = false;
        reason = "Unknown usage type";
    }

    return NextResponse.json({
      allowed,
      reason,
    });
  } catch (err) {
    console.error("USAGE ENFORCE ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
