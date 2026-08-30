import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await stripe.products.list({
      active: true,
      limit: 100,
    });

    return NextResponse.json({
      products: products.data.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        active: p.active,
      })),
    });
  } catch (err: any) {
    console.error("PRODUCTS ERROR:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
