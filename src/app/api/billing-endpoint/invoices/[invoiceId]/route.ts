import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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
      id: invoice.id,
      amount: invoice.amount_due,
      status: invoice.status,
      date: invoice.created,
      url: invoice.hosted_invoice_url,
      pdf: invoice.invoice_pdf,
      lines: invoice.lines.data.map((line) => ({
        id: line.id,
        description: line.description,
        amount: line.amount,
        quantity: line.quantity,
        priceId: (line as any).price?.id,   // ⭐ FIXED
      })),
    });
  } catch (err) {
    console.error("INVOICE DETAIL ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
