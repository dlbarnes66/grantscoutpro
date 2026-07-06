// app/api/stripe/customer/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia", // ⭐ REQUIRED FIX
});

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Missing email" },
        { status: 400 }
      );
    }

    // Create or retrieve Stripe customer
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customer = customers.data[0];

    if (!customer) {
      customer = await stripe.customers.create({
        email,
      });
    }

    return NextResponse.json({
      success: true,
      customerId: customer.id,
    });
  } catch (error) {
    console.error("STRIPE CUSTOMER ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create or retrieve customer" },
      { status: 500 }
    );
  }
}
