export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";




const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: null,
});

export async function POST(req: Request) {
  try {
    const { userId, email } = await req.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: "Missing userId or email" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.stripeCustomerId) {
      return NextResponse.json({ customerId: user.stripeCustomerId });
    }

    const customer = await stripe.customers.create({
      email,
      metadata: { userId },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id },
    });

    return NextResponse.json({ customerId: customer.id });
  } catch (err: any) {
    console.error("Create customer error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
