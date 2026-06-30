import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST() {
  const portal = await stripe.billingPortal.sessions.create({
    customer: "cus_12345", // Replace with real customer ID
    return_url: "https://yourapp.com/settings"
  });

  return NextResponse.json({ url: portal.url });
}
