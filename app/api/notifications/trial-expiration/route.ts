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
      .select("id, plan, trial_ends_at, owner_id")
      .eq("id", workspaceId)
      .single();

    if (workspaceError || !workspace) {
      console.error("Trial expiration fetch error:", workspaceError);
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    if (workspace.plan !== "trial") {
      return NextResponse.json({
        success: true,
        message: "Workspace is not on a trial plan. No notification sent.",
      });
    }

    const now = new Date();
    const trialEnd = workspace.trial_ends_at
      ? new Date(workspace.trial_ends_at)
      : null;

    if (!trialEnd) {
      return NextResponse.json({
        success: true,
        message: "Workspace has no trial end date. No notification sent.",
      });
    }

    const msLeft = trialEnd.getTime() - now.getTime();
    const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

    let title = "";
    let message = "";
    let type = "warning";

    if (daysLeft > 0 && daysLeft <= 3) {
      // Trial ending soon
      title = "Your trial is ending soon";
      message = `Your trial ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"}. Upgrade now to keep your workspace active.`;
    } else if (daysLeft <= 0) {
      // Trial expired
      title = "Your trial has expired";
      message = "Your workspace is now locked. Upgrade your plan to restore access.";
      type = "error";
    } else {
      return NextResponse.json({
        success: true,
        message: "Trial not close enough to send notification.",
      });
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
      console.error("Trial expiration notification error:", notifyError);
      return NextResponse.json(
        { error: "Failed to send trial expiration notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notification,
      daysLeft,
    });
  } catch (err: any) {
    console.error("Trial expiration route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
