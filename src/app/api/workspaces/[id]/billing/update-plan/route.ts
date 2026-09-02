import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

export async function POST(
  req: NextRequest,
  { params }: { params: Params }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.id },
      include: { billing: true },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    if (workspace.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.plan) {
      return NextResponse.json({ error: "Missing plan" }, { status: 400 });
    }

    const allowedPlans = ["free", "basic", "team", "pro", "enterprise"];
    if (!allowedPlans.includes(body.plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const updated = await prisma.workspaceBilling.update({
      where: { workspaceId: params.id },
      data: {
        plan: body.plan,
      },
    });

    await prisma.workspaceBillingActivity.create({
      data: {
        workspaceId: params.id,
        userId,
        action: "update-plan",
        metadata: { newPlan: body.plan },
      },
    });

    return NextResponse.json({ success: true, updated });
  } catch (err: any) {
    console.error("WORKSPACE UPDATE PLAN ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
