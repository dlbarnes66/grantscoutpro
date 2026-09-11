import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

export async function GET(
  _req: Request,
  { params: paramsPromise }: { params: Promise<Params> }
) {
  const params = await paramsPromise;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.id },
      include: {
        billing: true,
        members: true,
      },
    });

    if (!workspace || !workspace.billing) {
      return NextResponse.json({ error: "Workspace or billing not found" }, { status: 404 });
    }

    const isOwner = workspace.ownerId === userId;
    const isAdmin = workspace.members.some((m) => m.userId === userId && m.role === "admin");

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const billing = workspace.billing;
    const now = new Date();
    const start = billing.periodStart;
    const end = billing.periodEnd;
    const isTrialPlan = billing.plan === "trial";

    let status = "inactive";
    let daysRemaining = 0;

    if (isTrialPlan && start && end) {
      if (now < end) {
        status = "active";
        daysRemaining = Math.max(
          0,
          Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        );
      } else {
        status = "expired";
      }
    }

    return NextResponse.json({
      success: true,
      trial: {
        status,
        start,
        end,
        daysRemaining,
        plan: billing.plan,
      },
    });
  } catch (err: any) {
    console.error("WORKSPACE TRIAL STATUS ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
