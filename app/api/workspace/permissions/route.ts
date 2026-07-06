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

    // Fetch workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from("workspaces")
      .select("id, owner_id")
      .eq("id", workspaceId)
      .single();

    if (workspaceError || !workspace) {
      console.error("Workspace permissions fetch error:", workspaceError);
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    // Owner check
    if (workspace.owner_id === userId) {
      return NextResponse.json({
        success: true,
        role: "owner",
        canEditWorkspace: true,
        canManageMembers: true,
        canDeleteWorkspace: true,
      });
    }

    // Member check
    const { data: member, error: memberError } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)
      .single();

    if (memberError && memberError.code !== "PGRST116") {
      console.error("Workspace member permissions error:", memberError);
      return NextResponse.json(
        { error: "Failed to check workspace membership" },
        { status: 500 }
      );
    }

    if (!member) {
      return NextResponse.json({
        success: true,
        role: "none",
        canEditWorkspace: false,
        canManageMembers: false,
        canDeleteWorkspace: false,
      });
    }

    // Role-based permissions
    const role = member.role;

    return NextResponse.json({
      success: true,
      role,
      canEditWorkspace: role === "admin" || role === "editor",
      canManageMembers: role === "admin",
      canDeleteWorkspace: false, // Only owners can delete
    });
  } catch (err: any) {
    console.error("Workspace permissions route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
