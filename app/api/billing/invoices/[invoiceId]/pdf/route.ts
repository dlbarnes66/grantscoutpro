import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const invoice = await stripe.invoices.retrieve(params.id);

  return NextResponse.redirect(invoice.invoice_pdf!);
}
