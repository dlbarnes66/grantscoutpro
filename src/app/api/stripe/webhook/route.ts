import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function getPlanFromPriceId(priceId: string): string {
  const planMap: Record<string, string> = {
    [process.env.STRIPE_PRICE_BASIC_MONTHLY!]: "basic",
    [process.env.STRIPE_PRICE_BASIC_YEARLY!]: "basic",

    [process.env.STRIPE_PRICE_TEAM_MONTHLY!]: "team",
    [process.env.STRIPE_PRICE_TEAM_YEARLY!]: "team",

    [process.env.STRIPE_PRICE_BUSINESS_MONTHLY!]: "business",
    [process.env.STRIPE_PRICE_BUSINESS_YEARLY!]: "business",

    [process.env.STRIPE_PRICE_ENTERPRISE_YEARLY!]: "enterprise",
  };

  return planMap[priceId] ?? "basic";
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();

    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(
      "Stripe webhook signature error:",
      err
    );

    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session =
          event.data.object as Stripe.Checkout.Session;

        const userId = session.metadata?.userId;

        if (!userId) {
          break;
        }

        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            stripeCustomerId:
              session.customer as string,
            planName: "basic",
            status: "active",
            renewalDate: new Date(),
          },
        });

        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub =
          event.data.object as Stripe.Subscription;

        const userId = sub.metadata?.userId;

        if (!userId) {
          break;
        }

        const priceId =
          sub.items.data[0]?.price?.id ?? "";

        const plan =
          getPlanFromPriceId(priceId);

        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            stripeCustomerId:
              sub.customer as string,
            planName: plan,
            status: sub.status,
            renewalDate: new Date(
              (sub as any).current_period_end *
                1000
            ),
          },
        });

        break;
      }

      case "customer.subscription.deleted": {
        const sub =
          event.data.object as Stripe.Subscription;

        const userId = sub.metadata?.userId;

        if (!userId) {
          break;
        }

        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            status: "canceled",
            planName: "basic",
          },
        });

        break;
      }

      case "invoice.payment_succeeded": {
        console.log(
          "Invoice paid:",
          event.data.object.id
        );
        break;
      }

      default: {
        console.log(
          "Unhandled event:",
          event.type
        );
        break;
      }
    }

    return NextResponse.json({
      received: true,
    });
  } catch (err: any) {
    console.error(
      "Stripe webhook error:",
      err
    );

    return NextResponse.json(
      {
        error:
          err.message ??
          "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}