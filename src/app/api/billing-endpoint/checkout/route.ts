import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { workspaceId, plan } = await req.json();

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace?.stripeCustomerId) {
    return NextResponse.json({ error: "Customer not created" }, { status: 400 });
  }

  const priceId =
    plan === "team"
      ? process.env.STRIPE_PRICE_TEAM
      : process.env.STRIPE_PRICE_PRO;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: workspace.stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.APP_URL}/dashboard/${workspaceId}/billing`,
    cancel_url: `${process.env.APP_URL}/dashboard/${workspaceId}/billing`,
  });

  return NextResponse.json({ url: session.url });
}
