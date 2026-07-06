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

    // Fetch workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from("workspaces")
      .select("*")
      .eq("id", workspaceId)
      .single();

    if (workspaceError) {
      console.error("Supabase workspace sync error:", workspaceError);
      return NextResponse.json(
        { error: "Failed to fetch workspace" },
        { status: 500 }
      );
    }

    // Fetch members
    const { data: members, error: membersError } = await supabase
      .from("workspace_members")
      .select("id, user_id, role")
      .eq("workspace_id", workspaceId);

    if (membersError) {
      console.error("Supabase workspace members sync error:", membersError);
      return NextResponse.json(
        { error: "Failed to fetch workspace members" },
        { status: 500 }
      );
    }

    // Fetch grants
    const { data: grants, error: grantsError } = await supabase
      .from("grants")
      .select("*")
      .eq("workspace_id", workspaceId);

    if (grantsError) {
      console.error("Supabase workspace grants sync error:", grantsError);
      return NextResponse.json(
        { error: "Failed to fetch workspace grants" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      workspace,
      members,
      grants,
    });
  } catch (err: any) {
    console.error("Workspace sync route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
