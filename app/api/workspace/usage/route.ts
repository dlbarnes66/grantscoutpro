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

    // Fetch workspace plan + status
    const { data: workspace, error: workspaceError } = await supabase
      .from("workspaces")
      .select("plan, status")
      .eq("id", workspaceId)
      .single();

    if (workspaceError || !workspace) {
      console.error("Workspace usage fetch error:", workspaceError);
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    // Count grants
    const { count: grantsCount, error: grantsError } = await supabase
      .from("grants")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId);

    if (grantsError) {
      console.error("Usage grants count error:", grantsError);
    }

    // Count vault files
    const { count: filesCount, error: filesError } = await supabase
      .from("vault_files")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId);

    if (filesError) {
      console.error("Usage files count error:", filesError);
    }

    // Count AI structured extractions
    const { count: structuredCount, error: structuredError } = await supabase
      .from("vault_structured")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId);

    if (structuredError) {
      console.error("Usage structured count error:", structuredError);
    }

    // Count AI dashboard insights generated
    const { count: aiCount, error: aiError } = await supabase
      .from("ai_usage")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId);

    if (aiError) {
      console.error("Usage AI count error:", aiError);
    }

    // Build usage object
    const usage = {
      grants: grantsCount || 0,
      files: filesCount || 0,
      structuredExtractions: structuredCount || 0,
      aiInsights: aiCount || 0,
    };

    // Save usage snapshot
    const { error: saveError } = await supabase
      .from("workspace_usage")
      .insert({
        workspace_id: workspaceId,
        usage,
      });

    if (saveError) {
      console.error("Usage save error:", saveError);
      return NextResponse.json(
        { error: "Failed to save usage snapshot" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      workspaceId,
      plan: workspace.plan,
      status: workspace.status,
      usage,
    });
  } catch (err: any) {
    console.error("Workspace usage route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
