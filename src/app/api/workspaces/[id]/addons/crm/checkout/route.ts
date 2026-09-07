import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe, getAddonPriceId, type BillingInterval } from "@/lib/stripe";
import { hasCrmAccess } from "@/lib/crm/entitlement";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

// Starts a Stripe Checkout subscription for the CRM addon - billed
// separately from the workspace's plan subscription (see src/lib/stripe.ts
// for why), so this doesn't touch WorkspaceBilling.plan at all. The
// canonical webhook (src/app/api/webhooks/stripe/route.ts) activates the
// WorkspaceAddon row once the checkout completes.
export async function POST(req: NextRequest, context: { params: Promise<Params> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = await context.params;

  const workspace = await prisma.workspace.findUnique({
    where: { id: params.id },
    include: { billing: true },
  });

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }
  if (workspace.ownerId !== userId) {
    return NextResponse.json({ error: "Only the workspace owner can manage billing." }, { status: 403 });
  }

  if (await hasCrmAccess(workspace.id)) {
    return NextResponse.json({ error: "This workspace already has CRM access." }, { status: 400 });
  }

  const existingAddon = await prisma.workspaceAddon.findUnique({
    where: { workspaceId_addonType: { workspaceId: workspace.id, addonType: "crm" } },
  });
  if (existingAddon?.stripeSubscriptionId) {
    return NextResponse.json(
      { error: "A CRM addon subscription already exists for this workspace. Check the billing portal." },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const interval = (body.interval as BillingInterval | undefined) ?? "monthly";

  let priceId: string;
  try {
    priceId = getAddonPriceId("crm", interval);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    // Reuse the workspace's Stripe customer if it already has one from its
    // plan subscription, otherwise create one.
    let customerId = workspace.billing?.stripeCustomerId ?? undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({ metadata: { workspaceId: workspace.id } });
      customerId = customer.id;
      await prisma.workspaceBilling.upsert({
        where: { workspaceId: workspace.id },
        update: { stripeCustomerId: customerId },
        create: { workspaceId: workspace.id, stripeCustomerId: customerId },
      });
    }

    const appUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "";
    const returnPath = `/workspace/${workspace.id}/crm`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: workspace.id,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        metadata: { workspaceId: workspace.id, kind: "addon", addonType: "crm" },
      },
      metadata: { workspaceId: workspace.id, kind: "addon", addonType: "crm" },
      success_url: `${appUrl}${returnPath}?addon=success`,
      cancel_url: `${appUrl}${returnPath}?addon=canceled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("CRM ADDON CHECKOUT ERROR:", err);
    return NextResponse.json({ error: err.message ?? "Checkout failed" }, { status: 500 });
  }
}
