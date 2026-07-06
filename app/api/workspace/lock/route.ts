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
    const { workspaceId, action } = await req.json();

    if (!workspaceId || !action) {
      return NextResponse.json(
        { error: "workspaceId and action are required" },
        { status: 400 }
      );
    }

    if (!["lock", "unlock"].includes(action)) {
      return NextResponse.json(
        { error: "action must be 'lock' or 'unlock'" },
        { status: 400 }
      );
    }

    const newStatus = action === "lock" ? "locked" : "active";

    const { data, error } = await supabase
      .from("workspaces")
      .update({ status: newStatus })
      .eq("id", workspaceId)
      .select()
      .single();

    if (error) {
      console.error("Workspace lock/unlock error:", error);
      return NextResponse.json(
        { error: "Failed to update workspace status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      workspaceId,
      status: newStatus,
    });
  } catch (err: any) {
    console.error("Workspace lock route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
