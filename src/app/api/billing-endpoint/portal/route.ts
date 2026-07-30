import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { workspaceId } = await req.json();

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace?.stripeCustomerId) {
    return NextResponse.json({ error: "Customer not created" }, { status: 400 });
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: workspace.stripeCustomerId,
    return_url: `${process.env.APP_URL}/dashboard/${workspaceId}/billing`,
  });

  return NextResponse.json({ url: portal.url });
}
