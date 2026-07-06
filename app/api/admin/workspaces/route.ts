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
    const { action, workspaceId, status } = await req.json();

    if (!action) {
      return NextResponse.json(
        { error: "action is required" },
        { status: 400 }
      );
    }

    if (action === "list") {
      const { data, error } = await supabase
        .from("workspaces")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Admin workspaces list error:", error);
        return NextResponse.json(
          { error: "Failed to list workspaces" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        workspaces: data,
      });
    }

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required for this action" },
        { status: 400 }
      );
    }

    if (action === "lock" || action === "unlock") {
      const newStatus = action === "lock" ? "locked" : "active";

      const { data, error } = await supabase
        .from("workspaces")
        .update({ status: newStatus })
        .eq("id", workspaceId)
        .select()
        .single();

      if (error) {
        console.error("Admin workspace lock/unlock error:", error);
        return NextResponse.json(
          { error: "Failed to update workspace status" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        workspace: data,
      });
    }

    if (action === "set-status") {
      if (!status) {
        return NextResponse.json(
          { error: "status is required for set-status" },
          { status: 400 }
        );
      }

      const { data, error } = await supabase
        .from("workspaces")
        .update({ status })
        .eq("id", workspaceId)
        .select()
        .single();

      if (error) {
        console.error("Admin workspace set-status error:", error);
        return NextResponse.json(
          { error: "Failed to set workspace status" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        workspace: data,
      });
    }

    if (action === "delete") {
      const { error } = await supabase
        .from("workspaces")
        .delete()
        .eq("id", workspaceId);

      if (error) {
        console.error("Admin workspace delete error:", error);
        return NextResponse.json(
          { error: "Failed to delete workspace" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        deleted: workspaceId,
      });
    }

    return NextResponse.json(
      { error: "Unknown action" },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Admin workspaces route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
