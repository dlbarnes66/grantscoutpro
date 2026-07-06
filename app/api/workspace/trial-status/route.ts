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

    const { data: workspace, error } = await supabase
      .from("workspaces")
      .select("plan, trial_ends_at, status")
      .eq("id", workspaceId)
      .single();

    if (error || !workspace) {
      console.error("Trial status fetch error:", error);
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    const trialEnd = workspace.trial_ends_at
      ? new Date(workspace.trial_ends_at)
      : null;

    let trialActive = false;
    let trialExpired = false;

    if (workspace.plan === "trial" && trialEnd) {
      trialActive = now < trialEnd;
      trialExpired = now >= trialEnd;
    }

    return NextResponse.json({
      success: true,
      trialActive,
      trialExpired,
      trialEndsAt: workspace.trial_ends_at,
      workspaceStatus: workspace.status,
    });
  } catch (err: any) {
    console.error("Trial status route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
