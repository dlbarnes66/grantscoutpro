import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { workspaceId } = await req.json();

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    // Fetch workspace + owner
    const { data: workspace, error: workspaceError } = await supabase
      .from("workspaces")
      .select("id, owner_id, stripe_subscription_status")
      .eq("id", workspaceId)
      .single();

    if (workspaceError || !workspace) {
      console.error("Billing failure fetch error:", workspaceError);
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    const subStatus = workspace.stripe_subscription_status;

    if (!subStatus) {
      return NextResponse.json({
        success: true,
        message: "Workspace has no Stripe subscription status.",
      });
    }

    // Billing failure statuses
    const failureStatuses = [
      "past_due",
      "unpaid",
      "canceled",
      "incomplete",
      "incomplete_expired",
    ];

    if (!failureStatuses.includes(subStatus)) {
      return NextResponse.json({
        success: true,
        message: "Subscription is healthy. No billing failure notification sent.",
      });
    }

    // Build notification content
    let title = "Billing Issue Detected";
    let message =
      "We were unable to process your latest payment. Your workspace may be locked soon unless the issue is resolved.";
    let type = "error";

    if (subStatus === "canceled") {
      title = "Your Subscription Was Canceled";
      message =
        "Your workspace is now locked. Update your billing information to restore access.";
    }

    if (subStatus === "past_due") {
      title = "Payment Past Due";
      message =
        "Your payment is past due. Please update your billing information to avoid workspace lock.";
    }

    if (subStatus === "unpaid") {
      title = "Payment Failed";
      message =
        "Your payment could not be processed. Your workspace may be locked unless billing is updated.";
    }

    // Create notification
    const { data: notification, error: notifyError } = await supabase
      .from("notifications")
      .insert({
        workspace_id: workspaceId,
        user_id: workspace.owner_id,
        title,
        message,
        type,
        read: false,
      })
      .select()
      .single();

    if (notifyError) {
      console.error("Billing failure notification error:", notifyError);
      return NextResponse.json(
        { error: "Failed to send billing failure notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notification,
      subscriptionStatus: subStatus,
    });
  } catch (err: any) {
    console.error("Billing failure route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
