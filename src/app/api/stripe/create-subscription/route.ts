export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";




const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: null,
});

export async function POST(req: Request) {
  try {
    const { userId, priceId } = await req.json();

    if (!userId || !priceId) {
      return NextResponse.json(
        { error: "Missing userId or priceId" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.stripeCustomerId) {
      return NextResponse.json(
        { error: "User does not have a Stripe customer ID" },
        { status: 404 }
      );
    }

    const subscription = await stripe.subscriptions.create({
      customer: user.stripeCustomerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
    });

    return NextResponse.json({ subscription });
  } catch (err: any) {
    console.error("Create subscription error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
