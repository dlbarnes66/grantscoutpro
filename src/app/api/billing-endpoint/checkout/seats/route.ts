import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { workspaceId, seats } = body;

  if (!workspaceId || !seats) {
    return NextResponse.json(
      { error: "workspaceId and seats required" },
      { status: 400 }
    );
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { billing: true },
  });

  if (!workspace?.billing) {
    return NextResponse.json(
      { error: "Workspace or billing not found" },
      { status: 404 }
    );
  }

  // Falls back to the _MONTHLY price (or _YEARLY for enterprise, the only one
  // configured) since there's no monthly/yearly selector wired into this endpoint
  // yet. Set STRIPE_PRICE_<PLAN> directly if a plan should always use one price.
  const priceId = (() => {
    switch (workspace.billing.plan) {
      case "team":
        return (process.env.STRIPE_PRICE_TEAM || process.env.STRIPE_PRICE_TEAM_MONTHLY)!;
      case "business":
        return (process.env.STRIPE_PRICE_BUSINESS || process.env.STRIPE_PRICE_BUSINESS_MONTHLY)!;
      case "enterprise":
        return (process.env.STRIPE_PRICE_ENTERPRISE || process.env.STRIPE_PRICE_ENTERPRISE_YEARLY)!;
      default:
        return (process.env.STRIPE_PRICE_BASIC || process.env.STRIPE_PRICE_BASIC_MONTHLY)!;
    }
  })();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: workspace.billing.stripeCustomerId!,
    line_items: [
      {
        price: priceId,
        quantity: seats,
      },
    ],
    metadata: {
      workspaceId,
      clerkOrgId: orgId,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/workspace/${workspace.slug}/settings/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/workspace/${workspace.slug}/settings/billing?canceled=true`,
  });

  return NextResponse.json({ url: session.url });
}
