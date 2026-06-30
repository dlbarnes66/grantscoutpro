import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: "price_12345", // Replace with your Stripe price ID
        quantity: 1
      }
    ],
    success_url: "https://yourapp.com/billing/success",
    cancel_url: "https://yourapp.com/billing/cancel"
  });

  return NextResponse.json({ url: session.url });
}
