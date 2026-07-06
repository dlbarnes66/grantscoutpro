// app/api/stripe/usage/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia", // REQUIRED
});

export async function POST(req: Request) {
  try {
    const { subscriptionItemId, customerId, quantity } = await req.json();

    if (!subscriptionItemId || !customerId || typeof quantity !== "number") {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ⭐ NEW Stripe API — Meter Events
    const meterEvent = await stripe.billing.meterEvents.create({
      event_name: "grant_usage",
      payload: {
        value: String(quantity), // ⭐ FIX: must be a string
        stripe_customer_id: customerId,
        stripe_subscription_item_id: subscriptionItemId,
      },
    });

    return NextResponse.json({
      success: true,
      meterEvent,
    });
  } catch (error) {
    console.error("STRIPE USAGE ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record usage" },
      { status: 500 }
    );
  }
}
