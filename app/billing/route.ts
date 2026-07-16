import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      billing: {
        customerId: workspace.billing?.stripeCustomerId || null,
        subscriptionId: workspace.billing?.stripeSubscriptionId || null,
        status: workspace.billing?.plan || "free",
        tier: workspace.billing?.plan || "free",
        trialEnd: workspace.trialEnd,
      },
    });
  } catch (err) {
    console.error("Billing route error:", err);
    return NextResponse.json(
      { error: "Failed to load billing info" },
      { status: 500 }
    );
  }
}
