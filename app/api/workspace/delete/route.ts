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
    const { workspaceId, userId } = await req.json();

    if (!workspaceId || !userId) {
      return NextResponse.json(
        { error: "workspaceId and userId are required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: workspace, error: workspaceError } = await supabase
      .from("workspaces")
      .select("id, owner_id")
      .eq("id", workspaceId)
      .single();

    if (workspaceError || !workspace) {
      console.error("Workspace delete fetch error:", workspaceError);
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    if (workspace.owner_id !== userId) {
      return NextResponse.json(
        { error: "Only the workspace owner can delete this workspace" },
        { status: 403 }
      );
    }

    // Delete workspace members
    const { error: membersError } = await supabase
      .from("workspace_members")
      .delete()
      .eq("workspace_id", workspaceId);

    if (membersError) {
      console.error("Workspace delete members error:", membersError);
      return NextResponse.json(
        { error: "Failed to delete workspace members" },
        { status: 500 }
      );
    }

    // Delete grants
    const { error: grantsError } = await supabase
      .from("grants")
      .delete()
      .eq("workspace_id", workspaceId);

    if (grantsError) {
      console.error("Workspace delete grants error:", grantsError);
      return NextResponse.json(
        { error: "Failed to delete workspace grants" },
        { status: 500 }
      );
    }

    // Delete workspace
    const { error: workspaceDeleteError } = await supabase
      .from("workspaces")
      .delete()
      .eq("id", workspaceId);

    if (workspaceDeleteError) {
      console.error("Workspace delete error:", workspaceDeleteError);
      return NextResponse.json(
        { error: "Failed to delete workspace" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deleted: workspaceId,
    });
  } catch (err: any) {
    console.error("Workspace delete route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
