import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET() {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspace = await prisma.workspace.findFirst({
      where: { orgId },
      include: { billing: true },
    });

    if (!workspace?.billing?.stripeCustomerId) {
      return NextResponse.json(
        { error: "Workspace billing not found" },
        { status: 404 }
      );
    }

    const invoices = await stripe.invoices.list({
      customer: workspace.billing.stripeCustomerId,
      limit: 50,
    });

    return NextResponse.json({
      invoices: invoices.data.map((inv) => ({
        id: inv.id,
        amount: inv.amount_due,
        status: inv.status,
        date: inv.created,
        url: inv.hosted_invoice_url,
        pdf: inv.invoice_pdf,
      })),
    });
  } catch (err) {
    console.error("INVOICES ROUTE ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
