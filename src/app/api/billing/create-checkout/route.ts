import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const priceId = body.priceId;

  if (!priceId) {
    return NextResponse.json({ error: "priceId required" }, { status: 400 });
  }

  // Create Stripe customer using Clerk orgId only
  const customer = await stripe.customers.create({
    metadata: {
      clerkOrgId: orgId,
      createdBy: userId
    }
  });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customer.id,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.APP_URL}/dashboard/billing?success=true`,
    cancel_url: `${process.env.APP_URL}/dashboard/billing?canceled=true`
  });

  return NextResponse.json({ url: session.url });
}
