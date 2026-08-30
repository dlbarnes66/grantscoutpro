import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId || !sessionClaims?.superAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { action, workspaceId } = await req.json();

    if (!action) {
      return NextResponse.json({ error: "action is required" }, { status: 400 });
    }

    // -------------------------------------
    // RESET TRIAL
    // -------------------------------------
    if (action === "reset-trial") {
      if (!workspaceId) {
        return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
      }

      const updated = await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
          trialStart: new Date(),
          trialEnd: null,
          trialActive: true,
          trialLocked: false,
          trialDaysRemaining: 14,
        },
      });

      return NextResponse.json({ success: true, workspace: updated });
    }

    // -------------------------------------
    // RESET WORKSPACE LIMITS
    // -------------------------------------
    if (action === "reset-workspace-limits") {
      if (!workspaceId) {
        return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
      }

      // Reset seat limits
      const workspace = await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
          maxSeats: 1,
          currentSeats: 1,
        },
      });

      // Reset usage limits
      const billing = await prisma.workspaceBilling.update({
        where: { workspaceId },
        data: {
          usageSearches: 0,
          usageUploads: 0,
          usageMembers: 1,
          usageAI: 0,
        },
      });

      return NextResponse.json({
        success: true,
        workspace,
        billing,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });

  } catch (err: any) {
    console.error("ADMIN ACTION ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
