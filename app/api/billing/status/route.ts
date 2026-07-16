import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = session.user.workspaceId;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        billing: true,
      },
    });

    return NextResponse.json({
      ok: true,
      billing: {
        customerId: workspace?.billing?.stripeCustomerId || null,
        subscriptionId: workspace?.billing?.stripeSubscriptionId || null,
        trialEnd: workspace?.trialEnd || null,
        isPaid: Boolean(workspace?.billing?.stripeSubscriptionId),
      },
    });
  } catch (err) {
    console.error("Billing status error:", err);
    return NextResponse.json(
      { error: "Failed to load billing status" },
      { status: 500 }
    );
  }
}
