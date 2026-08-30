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

    const events = await stripe.events.list({
      limit: 20,
    });

    return NextResponse.json({
      events: events.data.map((evt) => ({
        id: evt.id,
        type: evt.type,
        created: evt.created,
      })),
    });
  } catch (err) {
    console.error("EVENTS ROUTE ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
