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

    // Fetch workspace info
    const { data: workspace, error: workspaceError } = await supabase
      .from("workspaces")
      .select("status, plan, trial_ends_at")
      .eq("id", workspaceId)
      .single();

    if (workspaceError || !workspace) {
      console.error("Dashboard workspace fetch error:", workspaceError);
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    // Fetch grants count
    const { count: grantsCount, error: grantsError } = await supabase
      .from("grants")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId);

    if (grantsError) {
      console.error("Dashboard grants count error:", grantsError);
    }

    // Fetch vault files count
    const { count: filesCount, error: filesError } = await supabase
      .from("vault_files")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId);

    if (filesError) {
      console.error("Dashboard files count error:", filesError);
    }

    // Fetch structured extractions count
    const { count: structuredCount, error: structuredError } = await supabase
      .from("vault_structured")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId);

    if (structuredError) {
      console.error("Dashboard structured count error:", structuredError);
    }

    // Trial logic
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
      workspaceStatus: workspace.status,
      plan: workspace.plan,
      trialActive,
      trialExpired,
      trialEndsAt: workspace.trial_ends_at,
      metrics: {
        grants: grantsCount || 0,
        files: filesCount || 0,
        structuredExtractions: structuredCount || 0,
      },
    });
  } catch (err: any) {
    console.error("Dashboard summary route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
