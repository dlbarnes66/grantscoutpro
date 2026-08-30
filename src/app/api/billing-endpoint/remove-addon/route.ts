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

  if (!workspace?.billing?.stripeSubscriptionId) {
    return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  }

  const subscription = await stripe.subscriptions.retrieve(
    workspace.billing.stripeSubscriptionId,
    { expand: ["items"] }
  );

  const item = subscription.items.data.find(
    (i) => (i.price as any).id === addonPriceId
  );

  if (!item) {
    return NextResponse.json({ removed: false, reason: "Addon not found" });
  }

  await stripe.subscriptions.update(subscription.id, {
    items: [
      {
        id: item.id,
        deleted: true,
      },
    ],
  });

  return NextResponse.json({ removed: true });
}
