import { NextRequest, NextResponse } from "next/server";
import { stripe, verifyStripeSignature } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const POST = async (req: NextRequest) => {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event;

  try {
    const rawBody = await req.text();
    event = verifyStripeSignature(rawBody, sig);
  } catch (err: any) {
    console.error("Stripe webhook signature error", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;

        const stripeSubscriptionId = subscription.id;
        const customerId = subscription.customer;
        const status = subscription.status;

        const normalized = {
          periodEnd: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000)
            : null,
        };

        await prisma.workspaceBilling.updateMany({
          where: { stripeSubscriptionId },
          data: {
            stripeCustomerId: customerId,
            status,
            periodEnd: normalized.periodEnd,
          },
        });

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;

        await prisma.billingLog.create({
          data: {
            type: "invoice_payment_succeeded",
            message: `Invoice ${invoice.id} paid`,
            stripeCustomerId: invoice.customer ?? undefined,
            stripeSubscriptionId: invoice.subscription ?? undefined,
          },
        });

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;

        await prisma.billingLog.create({
          data: {
            type: "invoice_payment_failed",
            message: `Invoice ${invoice.id} failed`,
            stripeCustomerId: invoice.customer ?? undefined,
            stripeSubscriptionId: invoice.subscription ?? undefined,
          },
        });

        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook handler error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};
