import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Use Stripe's default API version to avoid type mismatches
  apiVersion: null,
});

export async function POST(req: Request) {
  try {
    const { priceId, successUrl, cancelUrl } = await req.json();

    if (!priceId) {
      return NextResponse.json(
        { error: "Missing priceId" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl ?? `${process.env.NEXT_PUBLIC_APP_URL}/billing/success`,
      cancel_url: cancelUrl ?? `${process.env.NEXT_PUBLIC_APP_URL}/billing/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Checkout Error:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
