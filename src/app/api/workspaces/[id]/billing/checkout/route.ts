import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe, getPriceIdForPlan, type BillingInterval } from "@/lib/stripe";

export const dynamic = "force-dynamic";

type Params = { id: string };

// Starts a new Stripe Checkout subscription for this workspace. Only
// meant for a workspace that doesn't have an active subscription yet --
// once one exists, plan changes/cancellation go through the Stripe
// Customer Portal (see ../portal) so Stripe handles proration instead of
// this app guessing at it.
export async function POST(req: NextRequest, { params }: { params: Params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await prisma.workspace.findUnique({
    where: { id: params.id },
    include: { billing: true },
  });

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  if (workspace.ownerId !== userId) {
    return NextResponse.json(
      { error: "Only the workspace owner can manage billing." },
      { status: 403 }
    );
  }

  if (workspace.billing?.stripeSubscriptionId) {
    return NextResponse.json(
      { error: "This workspace already has an active subscription. Use Manage Billing to change plans." },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const planId = body.planId as string | undefined;
  const interval = (body.interval as BillingInterval | undefined) ?? "monthly";
  const seats = Number.isFinite(body.seats) && body.seats > 0 ? Math.floor(body.seats) : 1;

  if (!planId) {
    return NextResponse.json({ error: "planId is required" }, { status: 400 });
  }

  let priceId: string;
  try {
    priceId = getPriceIdForPlan(planId, interval);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    // Reuse the Stripe customer if this workspace already has one on file
    // (e.g. a prior subscription was canceled), otherwise create one.
    let customerId = workspace.billing?.stripeCustomerId ?? undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { workspaceId: workspace.id },
      });
      customerId = customer.id;
    }

    const appUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "";
    const returnPath = `/workspace/${workspace.id}/workspace-billing`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: workspace.id,
      line_items: [{ price: priceId, quantity: seats }],
      subscription_data: {
        metadata: { workspaceId: workspace.id, planId },
      },
      metadata: { workspaceId: workspace.id, planId },
      success_url: `${appUrl}${returnPath}?checkout=success`,
      cancel_url: `${appUrl}${returnPath}?checkout=canceled`,
    });

    // Record the Stripe customer right away so a page refresh (before the
    // webhook lands) doesn't create a second customer for this workspace.
    await prisma.workspaceBilling.upsert({
      where: { workspaceId: workspace.id },
      update: { stripeCustomerId: customerId },
      create: { workspaceId: workspace.id, stripeCustomerId: customerId },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("BILLING CHECKOUT ERROR:", err);
    return NextResponse.json({ error: err.message ?? "Checkout failed" }, { status: 500 });
  }
}
