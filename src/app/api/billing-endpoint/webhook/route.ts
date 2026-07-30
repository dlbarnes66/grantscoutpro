export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";




export async function POST(req: Request) {
  try {
    // Prevent Supabase from initializing during Next.js build
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      return NextResponse.json(
        { error: "Supabase environment variables missing" },
        { status: 500 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const event = await req.json();

    if (!event || !event.type) {
      return NextResponse.json(
        { error: "Invalid webhook event" },
        { status: 400 }
      );
    }

    // Handle subscription events
    if (event.type === "customer.subscription.updated") {
      const sub = event.data.object;

      const { error } = await supabase
        .from("subscriptions")
        .upsert(
          {
            stripe_customer_id: sub.customer,
            stripe_subscription_id: sub.id,
            status: sub.status,
            updated_at: new Date().toISOString()
          },
          { onConflict: "stripe_subscription_id" }
        );

      if (error) {
        console.error("Webhook subscription update error:", error);
        return NextResponse.json(
          { error: "Failed to update subscription" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
