import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  switch (event.type) {
    case "customer.subscription.created":
      console.log("Subscription created:", event.data.object.id);
      break;

    case "customer.subscription.updated":
      console.log("Subscription updated:", event.data.object.id);
      break;

    case "customer.subscription.deleted":
      console.log("Subscription canceled:", event.data.object.id);
      break;

    case "invoice.payment_succeeded":
      console.log("Invoice paid:", event.data.object.id);
      break;

    case "invoice.payment_failed":
      console.log("Invoice failed:", event.data.object.id);
      break;
  }

  return NextResponse.json({ received: true });
}
