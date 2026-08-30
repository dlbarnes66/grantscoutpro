import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { workspaceId } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId required" },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { billing: true },
    });

    if (!workspace?.billing?.stripeCustomerId) {
      return NextResponse.json(
        { error: "Workspace billing not found" },
        { status: 404 }
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: workspace.billing.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/workspace/${workspace.slug}/settings/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("PORTAL SESSION ERROR:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
