import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { customerId, quantity } = await req.json();

  const record = await stripe.subscriptionItems.createUsageRecord(
    "si_12345", // Replace with your subscription item ID
    {
      quantity,
      timestamp: Math.floor(Date.now() / 1000),
      action: "increment"
    }
  );

  return NextResponse.json({ record });
}
