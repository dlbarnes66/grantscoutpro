import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { workspaceId, plan } = body;

    if (!workspaceId || !plan) {
      return NextResponse.json(
        { error: "workspaceId and plan required" },
        { status: 400 }
      );
    }

    const validPlans = ["basic", "team", "business", "enterprise"];
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { billing: true },
    });

    if (!workspace || !workspace.billing) {
      return NextResponse.json(
        { error: "Workspace or billing not found" },
        { status: 404 }
      );
    }

    await prisma.workspaceBilling.update({
      where: { id: workspace.billing.id },
      data: { plan },
    });

    await prisma.workspace.update({
      where: { id: workspace.id },
      data: { subscriptionTier: plan },
    });

    return NextResponse.json({
      updated: true,
      plan,
    });
  } catch (err) {
    console.error("PLAN UPDATE ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
