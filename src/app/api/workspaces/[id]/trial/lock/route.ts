import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

export async function POST(
  _req: Request,
  { params }: { params: Params }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.id },
      include: { billing: true },
    });

    if (!workspace || !workspace.billing) {
      return NextResponse.json({ error: "Workspace or billing not found" }, { status: 404 });
    }

    if (workspace.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // We don't have trialLocked in billing, so we just log the action.
    await prisma.workspaceActivity.create({
      data: {
        workspaceId: params.id,
        userId,
        action: "trial-lock",
        metadata: {
          plan: workspace.billing.plan,
          periodStart: workspace.billing.periodStart,
          periodEnd: workspace.billing.periodEnd,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("WORKSPACE TRIAL LOCK ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
