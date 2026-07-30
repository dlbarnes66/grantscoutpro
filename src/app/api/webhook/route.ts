export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";



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

    // ⭐ Your User model does NOT contain any subscription fields.
    // So we simply acknowledge the event without writing to the DB.

    switch (event.type) {
      case "customer.subscription.created":
        console.log("Subscription created:", event.data.object.id);
        break;

      case "customer.subscription.updated":
        console.log("Subscription updated:", event.data.object.id);
        break;

      case "customer.subscription.deleted":
        console.log("Subscription deleted:", event.data.object.id);
        break;

      default:
        console.log("Unhandled event type:", event.type);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("STRIPE WEBHOOK ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
