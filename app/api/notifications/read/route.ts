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
    const { notificationId, userId } = await req.json();

    if (!notificationId || !userId) {
      return NextResponse.json(
        { error: "notificationId and userId are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Notification read error:", error);
      return NextResponse.json(
        { error: "Failed to mark notification as read" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notification: data,
    });
  } catch (err: any) {
    console.error("Notification read route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
