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
  const { workspaceId } = body;

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { billing: true },
  });

  if (!workspace?.billing?.stripeSubscriptionId) {
    return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  }

  const subscription = await stripe.subscriptions.retrieve(
    workspace.billing.stripeSubscriptionId,
    { expand: ["items"] }
  );

  const item = subscription.items.data[0];

  const periodStart = (subscription as any).current_period_start;
  const periodEnd = (subscription as any).current_period_end;

  await prisma.workspaceBilling.update({
    where: { id: workspace.billing.id },
    data: {
      plan: item.price.id,
      seats: item.quantity ?? 1,
      periodStart: new Date(periodStart * 1000),
      periodEnd: new Date(periodEnd * 1000),
    },
  });

  await prisma.workspace.update({
    where: { id: workspace.id },
    data: {
      billingStatus: subscription.status,
      subscriptionTier: item.price.id,
      billingRenewalDate: new Date(periodEnd * 1000),
    },
  });

  return NextResponse.json({ synced: true });
}
