import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { workspaceId, addonPriceId } = body;

  if (!workspaceId || !addonPriceId) {
    return NextResponse.json(
      { error: "workspaceId and addonPriceId required" },
      { status: 400 }
    );
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { billing: true },
  });

  if (!workspace?.billing) {
    return NextResponse.json(
      { error: "Workspace or billing not found" },
      { status: 404 }
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: workspace.billing.stripeCustomerId!,
    line_items: [
      {
        price: addonPriceId,
        quantity: 1,
      },
    ],
    metadata: {
      workspaceId,
      clerkOrgId: orgId,
      addon: addonPriceId,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/workspace/${workspace.slug}/settings/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/workspace/${workspace.slug}/settings/billing?canceled=true`,
  });

  return NextResponse.json({ url: session.url });
}
