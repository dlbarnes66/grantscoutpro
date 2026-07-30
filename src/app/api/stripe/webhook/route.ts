export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";



// Do NOT specify apiVersion — your installed Stripe SDK requires a custom pinned version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error("Webhook signature error:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle subscription updates — but do NOT write to DB
    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;

      const customerId = subscription.customer as string;

      const user = await prisma.user.findUnique({
        where: { stripeCustomerId: customerId },
      });

      if (!user) {
        console.error("No user found for Stripe customer:", customerId);
        return NextResponse.json({ received: true });
      }

      // Your User model does NOT contain any billing fields.
      // So we simply acknowledge the event.
      console.log("Stripe subscription updated for user:", user.id);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("STRIPE WEBHOOK ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
