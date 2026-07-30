export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";




const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: null,
});

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
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

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Portal session error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
