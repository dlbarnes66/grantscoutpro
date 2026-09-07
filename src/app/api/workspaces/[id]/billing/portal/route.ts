import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

type Params = { id: string };

// Sends the workspace owner to Stripe's hosted Customer Portal to change
// plan, update payment method, or cancel. Deliberately not hand-rolling
// upgrade/downgrade/proration logic here -- Stripe's portal already does
// this correctly and stays in sync via the same webhook this app listens
// on (see /api/webhooks/stripe).
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

  const customerId = workspace.billing?.stripeCustomerId;
  if (!customerId) {
    return NextResponse.json(
      { error: "This workspace doesn't have a Stripe customer yet. Subscribe to a plan first." },
      { status: 400 }
    );
  }

  try {
    const appUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "";
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/workspace/${workspace.id}/workspace-billing`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (err: any) {
    console.error("BILLING PORTAL ERROR:", err);
    return NextResponse.json({ error: err.message ?? "Could not open billing portal" }, { status: 500 });
  }
}
