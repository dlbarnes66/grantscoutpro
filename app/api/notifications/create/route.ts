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
    const { workspaceId, userId, title, message, type } = await req.json();

    if (!workspaceId || !userId || !title || !message) {
      return NextResponse.json(
        { error: "workspaceId, userId, title, and message are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        workspace_id: workspaceId,
        user_id: userId,
        title,
        message,
        type: type || "info",
        read: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Notification create error:", error);
      return NextResponse.json(
        { error: "Failed to create notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notification: data,
    });
  } catch (err: any) {
    console.error("Notification create route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
