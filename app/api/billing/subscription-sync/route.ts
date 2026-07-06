import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { workspaceId, subscriptionId } = await req.json();

    if (!workspaceId || !subscriptionId) {
      return NextResponse.json(
        { error: "workspaceId and subscriptionId are required" },
        { status: 400 }
      );
    }

    // Fetch subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found in Stripe" },
        { status: 404 }
      );
    }

    const status = subscription.status;

    // Map Stripe status → workspace status
    let workspaceStatus = "active";

    const lockStatuses = [
      "past_due",
      "unpaid",
      "canceled",
      "incomplete",
      "incomplete_expired",
    ];

    if (lockStatuses.includes(status)) {
      workspaceStatus = "locked";
    }

    // Update workspace
    const { error: updateError } = await supabase
      .from("workspaces")
      .update({
        stripe_subscription_id: subscriptionId,
        stripe_subscription_status: status,
        status: workspaceStatus,
        plan: "paid",
      })
      .eq("id", workspaceId);

    if (updateError) {
      console.error("Subscription sync update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update workspace subscription status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      workspaceId,
      stripeStatus: status,
      workspaceStatus,
    });
  } catch (err: any) {
    console.error("Subscription sync route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
