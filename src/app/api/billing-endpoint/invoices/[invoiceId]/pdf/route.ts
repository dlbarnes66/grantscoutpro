import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { invoiceId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoiceId = params.invoiceId;

    const invoice = await stripe.invoices.retrieve(invoiceId);

    return NextResponse.json({
      pdf: invoice.invoice_pdf,
      url: invoice.hosted_invoice_url,
    });
  } catch (err) {
    console.error("INVOICE PDF ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
