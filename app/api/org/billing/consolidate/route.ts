import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: null,
});

export async function POST(req: Request) {
  try {
    const { parentOrgId, childOrgIds } = await req.json();

    if (!parentOrgId || !childOrgIds || childOrgIds.length === 0) {
      return NextResponse.json(
        { error: "Missing parentOrgId or childOrgIds" },
        { status: 400 }
      );
    }

    const parent = await prisma.organization.findUnique({
      where: { id: parentOrgId },
    });

    if (!parent?.stripeCustomerId) {
      return NextResponse.json(
        { error: "Parent org missing Stripe customer" },
        { status: 400 }
      );
    }

    for (const childId of childOrgIds) {
      const child = await prisma.organization.findUnique({
        where: { id: childId },
      });

      if (!child?.stripeCustomerId) continue;

      await stripe.invoices.create({
        customer: parent.stripeCustomerId,
        description: `Consolidated billing for org ${childId}`,
      });

      await prisma.organization.update({
        where: { id: childId },
        data: { billingParentId: parentOrgId },
      });
    }

    return NextResponse.json({ consolidated: true });
  } catch (err: any) {
    console.error("Billing consolidation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
