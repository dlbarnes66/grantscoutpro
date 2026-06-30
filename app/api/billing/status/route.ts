import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function GET() {
  const subscription = await stripe.subscriptions.retrieve("sub_12345");

  return NextResponse.json({
    status: subscription.status,
    current_period_end: subscription.current_period_end,
    plan: subscription.items.data[0].price.nickname
  });
}
