import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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
    const { workspaceId, mode } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        billing: true,
        owner: true,
      },
    });

    if (!workspace || !workspace.billing) {
      return NextResponse.json(
        { error: "Workspace or billing not found" },
        { status: 404 }
      );
    }

    const billing = workspace.billing;

    // If subscription exists → Billing Portal
    if (billing.stripeSubscriptionId && mode !== "checkout") {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: billing.stripeCustomerId!,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/workspace/${workspace.slug}/settings/billing`,
      });

      return NextResponse.json({
        url: portalSession.url,
        type: "portal",
      });
    }

    // No subscription → Checkout Session
    const priceId = (() => {
      switch (billing.plan) {
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

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: billing.stripeCustomerId!,
      line_items: [
        {
          price: priceId,
          quantity: billing.seats ?? 1,
        },
      ],
      metadata: {
        workspaceId: workspace.id,
        clerkOrgId: orgId,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/workspace/${workspace.slug}/settings/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/workspace/${workspace.slug}/settings/billing?canceled=true`,
    });

    return NextResponse.json({
      url: checkoutSession.url,
      type: "checkout",
    });
  } catch (err) {
    console.error("CREATE SESSION ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
