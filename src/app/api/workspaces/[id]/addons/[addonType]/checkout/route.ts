import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe, getAddonPriceId, type AddonType, type BillingInterval } from "@/lib/stripe";
import { hasCrmAccess } from "@/lib/crm/entitlement";
import { hasStateAccess, hasFoundationAccess } from "@/lib/grants/entitlement";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string; addonType: string };

// Starts a Stripe Checkout subscription for a workspace addon (CRM, State,
// or Foundations) - billed separately from the workspace's plan
// subscription (see src/lib/stripe.ts for why), so this never touches
// WorkspaceBilling.plan. The canonical webhook
// (src/app/api/webhooks/stripe/route.ts) activates the WorkspaceAddon row
// once checkout completes, keyed off the addonType in the session/
// subscription metadata set below.
//
// Replaces what used to be a CRM-only route at
// .../addons/crm/checkout/route.ts - that URL still works, it's just
// handled here now via the [addonType] segment, alongside state and
// foundations.

const ADDON_LABELS: Record<AddonType, string> = {
  crm: "CRM",
  state: "State grants",
  foundations: "Private foundation grants",
};

const ADDON_RETURN_PATH: Record<AddonType, string> = {
  crm: "crm",
  state: "grants",
  foundations: "grants",
};

function isAddonType(value: string): value is AddonType {
  return value === "crm" || value === "state" || value === "foundations";
}

function hasAccess(addonType: AddonType, workspaceId: string): Promise<boolean> {
  if (addonType === "crm") return hasCrmAccess(workspaceId);
  if (addonType === "state") return hasStateAccess(workspaceId);
  return hasFoundationAccess(workspaceId);
}

export async function POST(req: NextRequest, context: { params: Promise<Params> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = await context.params;
  if (!isAddonType(params.addonType)) {
    return NextResponse.json({ error: `Unknown addon "${params.addonType}".` }, { status: 400 });
  }
  const addonType = params.addonType;

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

  if (await hasAccess(addonType, workspace.id)) {
    return NextResponse.json(
      { error: `This workspace already has ${ADDON_LABELS[addonType]} access.` },
      { status: 400 }
    );
  }

  const existingAddon = await prisma.workspaceAddon.findUnique({
    where: { workspaceId_addonType: { workspaceId: workspace.id, addonType } },
  });
  if (existingAddon?.stripeSubscriptionId) {
    return NextResponse.json(
      {
        error: `A ${ADDON_LABELS[addonType]} addon subscription already exists for this workspace. Check the billing portal.`,
      },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const interval = (body.interval as BillingInterval | undefined) ?? "monthly";

  let priceId: string;
  try {
    priceId = getAddonPriceId(addonType, interval);
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
    const returnPath = `/workspace/${workspace.id}/${ADDON_RETURN_PATH[addonType]}`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: workspace.id,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        metadata: { workspaceId: workspace.id, kind: "addon", addonType },
      },
      metadata: { workspaceId: workspace.id, kind: "addon", addonType },
      success_url: `${appUrl}${returnPath}?addon=success`,
      cancel_url: `${appUrl}${returnPath}?addon=canceled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error(`${addonType.toUpperCase()} ADDON CHECKOUT ERROR:`, err);
    return NextResponse.json({ error: err.message ?? "Checkout failed" }, { status: 500 });
  }
}
