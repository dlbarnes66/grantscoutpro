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
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const workspaceId = subscription.metadata.workspaceId;

        if (!workspaceId) {
          console.error("Missing workspaceId in subscription metadata");
          break;
        }

        const status = subscription.status;

        // Determine workspace lock/unlock
        const lockStatuses = [
          "past_due",
          "unpaid",
          "canceled",
          "incomplete",
          "incomplete_expired",
        ];

        const workspaceStatus = lockStatuses.includes(status)
          ? "locked"
          : "active";

        // Update workspace billing state
        const { error: updateError } = await supabase
          .from("workspaces")
          .update({
            stripe_subscription_id: subscription.id,
            stripe_subscription_status: status,
            status: workspaceStatus,
            plan: "paid",
          })
          .eq("id", workspaceId);

        if (updateError) {
          console.error("Workspace update error:", updateError);
        }

        // Create notification
        const { error: notifyError } = await supabase
          .from("notifications")
          .insert({
            workspace_id: workspaceId,
            user_id: subscription.metadata.userId || null,
            title: "Subscription Update",
            message: `Your subscription status changed to: ${status}.`,
            type: lockStatuses.includes(status) ? "error" : "success",
            read: false,
          });

        if (notifyError) {
          console.error("Notification error:", notifyError);
        }

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const workspaceId = invoice.metadata.workspaceId;

        if (!workspaceId) break;

        // Lock workspace
        await supabase
          .from("workspaces")
          .update({ status: "locked" })
          .eq("id", workspaceId);

        // Notify user
        await supabase.from("notifications").insert({
          workspace_id: workspaceId,
          user_id: invoice.metadata.userId || null,
          title: "Payment Failed",
          message:
            "Your payment could not be processed. Please update your billing information.",
          type: "error",
          read: false,
        });

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const workspaceId = invoice.metadata.workspaceId;

        if (!workspaceId) break;

        // Unlock workspace
        await supabase
          .from("workspaces")
          .update({ status: "active" })
          .eq("id", workspaceId);

        // Notify user
        await supabase.from("notifications").insert({
          workspace_id: workspaceId,
          user_id: invoice.metadata.userId || null,
          title: "Payment Successful",
          message: "Your workspace is now active.",
          type: "success",
          read: false,
        });

        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return NextResponse.json(
      { error: err.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}
