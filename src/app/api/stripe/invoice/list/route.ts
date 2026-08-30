import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("WEBHOOK SIGNATURE ERROR:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.created":
      case "customer.updated": {
        const customer = event.data.object as Stripe.Customer;

        await prisma.workspaceBilling.updateMany({
          where: { stripeCustomerId: customer.id },
          data: {
            customerEmail: customer.email ?? undefined,
          },
        });

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const item = sub.items.data[0];

        const periodStart = (sub as any).current_period_start;
        const periodEnd = (sub as any).current_period_end;

        await prisma.workspaceBilling.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            stripeSubscriptionId: sub.id,
            plan: item.price.id,
            seats: item.quantity ?? 1,
            periodStart: new Date(periodStart * 1000),
            periodEnd: new Date(periodEnd * 1000),
          },
        });

        await prisma.workspace.updateMany({
          where: { billing: { stripeCustomerId: customerId } },
          data: {
            billingStatus: sub.status,
            subscriptionTier: item.price.id,
            billingRenewalDate: new Date(periodEnd * 1000),
            trialActive: false,
            trialLocked: false,
          },
        });

        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        await prisma.workspace.updateMany({
          where: { billing: { stripeCustomerId: customerId } },
          data: {
            billingStatus: "canceled",
            subscriptionTier: "basic",
            trialLocked: true,
          },
        });

        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        await prisma.workspace.updateMany({
          where: { billing: { stripeCustomerId: customerId } },
          data: {
            billingStatus: "active",
          },
        });

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        await prisma.workspace.updateMany({
          where: { billing: { stripeCustomerId: customerId } },
          data: {
            billingStatus: "past_due",
          },
        });

        break;
      }

      case "customer.subscription.trial_will_end": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        await prisma.workspace.updateMany({
          where: { billing: { stripeCustomerId: customerId } },
          data: {
            trialLocked: true,
          },
        });

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("WEBHOOK PROCESSING ERROR:", err);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}
