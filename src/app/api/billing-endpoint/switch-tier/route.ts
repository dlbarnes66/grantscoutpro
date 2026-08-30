import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { workspaceId, newPlan } = body;

    if (!workspaceId || !newPlan) {
      return NextResponse.json(
        { error: "workspaceId and newPlan required" },
        { status: 400 }
      );
    }

    const validPlans = ["basic", "team", "business", "enterprise"];
    if (!validPlans.includes(newPlan)) {
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

    const billing = workspace.billing;

    if (!billing.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "No active subscription to switch" },
        { status: 400 }
      );
    }

    // Fetch subscription from Stripe to get item ID
    const subscription = await stripe.subscriptions.retrieve(
      billing.stripeSubscriptionId,
      { expand: ["items"] }
    );

    const subscriptionItemId = subscription.items.data[0].id;

    const priceId = (() => {
      switch (newPlan) {
        case "team":
          return process.env.STRIPE_PRICE_TEAM!;
        case "business":
          return process.env.STRIPE_PRICE_BUSINESS!;
        case "enterprise":
          return process.env.STRIPE_PRICE_ENTERPRISE!;
        default:
          return process.env.STRIPE_PRICE_BASIC!;
      }
    })();

    await stripe.subscriptions.update(billing.stripeSubscriptionId, {
      items: [
        {
          id: subscriptionItemId,
          price: priceId,
        },
      ],
    });

    await prisma.workspaceBilling.update({
      where: { id: billing.id },
      data: { plan: newPlan },
    });

    await prisma.workspace.update({
      where: { id: workspace.id },
      data: { subscriptionTier: newPlan },
    });

    return NextResponse.json({
      switched: true,
      plan: newPlan,
    });
  } catch (err) {
    console.error("SWITCH TIER ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
