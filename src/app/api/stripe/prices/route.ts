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

    const prices = await stripe.prices.list({
      active: true,
      limit: 100,
      expand: ["data.product"],
    });

    return NextResponse.json({
      prices: prices.data.map((p) => ({
        id: p.id,
        nickname: p.nickname,
        amount: p.unit_amount,
        interval: p.recurring?.interval,
        product: (p.product as any)?.name,
      })),
    });
  } catch (err: any) {
    console.error("PRICES ERROR:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
