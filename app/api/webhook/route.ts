import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

// Required for Stripe raw body parsing in Next.js App Router
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: null,
});

// Helper to read raw request body
async function getRawBody(req: Request): Promise<Buffer> {
  const reader = req.body?.getReader();
  const chunks: Uint8Array[] = [];

  if (!reader) return Buffer.from([]);

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return Buffer.concat(chunks);
}

export async function POST(req: Request) {
  try {
    const rawBody = await getRawBody(req);
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature!,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        await prisma.user.update({
          where: { stripeCustomerId: session.customer as string },
          data: { subscriptionStatus: "active" },
        });

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;

        await prisma.user.update({
          where: { stripeCustomerId: invoice.customer as string },
          data: { subscriptionStatus: "active" },
        });

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await prisma.user.update({
          where: { stripeCustomerId: subscription.customer as string },
          data: { subscriptionStatus: "canceled" },
        });

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
