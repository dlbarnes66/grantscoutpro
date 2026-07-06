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
    const { workspaceId, title, message, type } = await req.json();

    if (!title || !message) {
      return NextResponse.json(
        { error: "title and message are required" },
        { status: 400 }
      );
    }

    // If workspaceId is null → broadcast to ALL workspaces
    let workspaceFilter = {};
    if (workspaceId) {
      workspaceFilter = { workspace_id: workspaceId };
    }

    // Fetch all users in the target workspace(s)
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, workspace_id")
      .match(workspaceFilter);

    if (usersError) {
      console.error("Admin broadcast user fetch error:", usersError);
      return NextResponse.json(
        { error: "Failed to fetch users for broadcast" },
        { status: 500 }
      );
    }

    if (!users || users.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No users found to broadcast to.",
      });
    }

    // Build notifications
    const notifications = users.map((u) => ({
      workspace_id: u.workspace_id,
      user_id: u.id,
      title,
      message,
      type: type || "info",
      read: false,
    }));

    // Insert notifications
    const { data: inserted, error: insertError } = await supabase
      .from("notifications")
      .insert(notifications)
      .select();

    if (insertError) {
      console.error("Admin broadcast insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to send broadcast notifications" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: inserted.length,
      broadcastType: workspaceId ? "workspace" : "global",
      title,
    });
  } catch (err: any) {
    console.error("Admin broadcast route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
