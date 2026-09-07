import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { verifyStripeSignature, getPlanIdFromPriceId } from "@/lib/stripe";

export const dynamic = "force-dynamic";

// The single canonical Stripe webhook for this app. Point Stripe's
// webhook endpoint (dashboard, or `stripe listen` locally) at
// /api/webhooks/stripe -- the other two Stripe webhook route files in
// this codebase (/api/stripe/webhook, /api/billing/webhook) are unused
// legacy scaffolding from an earlier Clerk-Organizations-based billing
// design that doesn't match how workspaces/billing actually work here;
// don't register either of those URLs in Stripe.

function invoiceSubscriptionId(invoice: Stripe.Invoice): string | undefined {
  const sub = invoice.parent?.subscription_details?.subscription;
  if (!sub) return undefined;
  return typeof sub === "string" ? sub : sub.id;
}

async function findBillingRowForSubscription(sub: Stripe.Subscription) {
  const workspaceId = sub.metadata?.workspaceId;
  if (workspaceId) {
    const byWorkspace = await prisma.workspaceBilling.findUnique({ where: { workspaceId } });
    if (byWorkspace) return byWorkspace;
  }
  return prisma.workspaceBilling.findFirst({ where: { stripeSubscriptionId: sub.id } });
}

export const POST = async (req: NextRequest) => {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    event = verifyStripeSignature(rawBody, sig) as Stripe.Event;
  } catch (err: any) {
    console.error("Stripe webhook signature error", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      // Fired once at the end of a successful Checkout. The
      // customer.subscription.created event (below) is what actually
      // persists plan/status/seats -- this just makes sure the
      // subscription ID is linked to the right workspace right away.
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const workspaceId = session.metadata?.workspaceId ?? session.client_reference_id;
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

        if (workspaceId && subscriptionId) {
          await prisma.workspaceBilling.upsert({
            where: { workspaceId },
            update: { stripeSubscriptionId: subscriptionId },
            create: { workspaceId, stripeSubscriptionId: subscriptionId },
          });
        }

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const billing = await findBillingRowForSubscription(sub);
        if (!billing) {
          console.warn("Stripe webhook: no WorkspaceBilling found for subscription", sub.id);
          break;
        }

        const priceId = sub.items.data[0]?.price?.id;
        const planId = getPlanIdFromPriceId(priceId) ?? sub.metadata?.planId ?? billing.plan;
        const seats = sub.items.data[0]?.quantity ?? billing.seats;

        await prisma.workspaceBilling.update({
          where: { id: billing.id },
          data: {
            stripeSubscriptionId: sub.id,
            stripeCustomerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
            plan: planId,
            seats,
            status: sub.status,
            cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
            periodEnd: (sub as any).current_period_end
              ? new Date((sub as any).current_period_end * 1000)
              : null,
          },
        });

        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const billing = await findBillingRowForSubscription(sub);
        if (!billing) break;

        await prisma.workspaceBilling.update({
          where: { id: billing.id },
          data: {
            status: "canceled",
            cancelAtPeriodEnd: false,
          },
        });

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;

        if (customerId) {
          await prisma.workspaceBilling.updateMany({
            where: { stripeCustomerId: customerId },
            data: { status: "past_due" },
          });
        }

        await prisma.billingLog.create({
          data: {
            type: "invoice_payment_failed",
            message: `Invoice ${invoice.id} failed`,
            stripeCustomerId: customerId ?? undefined,
            stripeSubscriptionId: invoiceSubscriptionId(invoice),
          },
        });

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;

        // Covers the "card got fixed after a failed payment" recovery
        // case. A subscription.updated event normally follows too, but
        // this clears the past-due banner immediately rather than
        // waiting on event ordering.
        if (customerId) {
          await prisma.workspaceBilling.updateMany({
            where: { stripeCustomerId: customerId, status: "past_due" },
            data: { status: "active" },
          });
        }

        await prisma.billingLog.create({
          data: {
            type: "invoice_payment_succeeded",
            message: `Invoice ${invoice.id} paid`,
            stripeCustomerId: customerId ?? undefined,
            stripeSubscriptionId: invoiceSubscriptionId(invoice),
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
