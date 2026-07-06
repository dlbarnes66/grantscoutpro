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

    // Fetch workspace billing info
    const { data: workspace, error } = await supabase
      .from("workspaces")
      .select(
        `
        id,
        plan,
        status,
        trial_ends_at,
        stripe_customer_id,
        stripe_subscription_id,
        stripe_subscription_status
      `
      )
      .eq("id", workspaceId)
      .single();

    if (error || !workspace) {
      console.error("Billing status fetch error:", error);
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    // Determine trial state
    let trialActive = false;
    let trialDaysLeft = null;

    if (workspace.plan === "trial" && workspace.trial_ends_at) {
      const now = new Date();
      const trialEnd = new Date(workspace.trial_ends_at);
      const msLeft = trialEnd.getTime() - now.getTime();

      if (msLeft > 0) {
        trialActive = true;
        trialDaysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
      }
    }

    // Determine billing health
    const unhealthyStatuses = [
      "past_due",
      "unpaid",
      "canceled",
      "incomplete",
      "incomplete_expired",
    ];

    const billingHealthy =
      workspace.stripe_subscription_status &&
      !unhealthyStatuses.includes(workspace.stripe_subscription_status);

    return NextResponse.json({
      success: true,
      workspaceId,
      plan: workspace.plan,
      status: workspace.status,
      trialActive,
      trialEndsAt: workspace.trial_ends_at,
      trialDaysLeft,
      stripeCustomerId: workspace.stripe_customer_id,
      stripeSubscriptionId: workspace.stripe_subscription_id,
      stripeSubscriptionStatus: workspace.stripe_subscription_status,
      billingHealthy,
    });
  } catch (err: any) {
    console.error("Billing status route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
