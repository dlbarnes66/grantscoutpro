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

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Notification list error:", error);
      return NextResponse.json(
        { error: "Failed to fetch notifications" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notifications: data || [],
    });
  } catch (err: any) {
    console.error("Notification list route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
