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

    const { customerId, subscriptionId, status } = await req.json();

    if (!customerId || !subscriptionId) {
      return NextResponse.json(
        { error: "customerId and subscriptionId are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .upsert(
        {
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          status: status || "active",
          updated_at: new Date().toISOString()
        },
        { onConflict: "stripe_subscription_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("Subscription sync error:", error);
      return NextResponse.json(
        { error: "Failed to sync subscription" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      subscription: data
    });
  } catch (err: any) {
    console.error("Subscription sync route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
