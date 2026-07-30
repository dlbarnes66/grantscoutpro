export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";




export async function POST(req: Request) {
  try {
    // Prevent Supabase from initializing during Next.js build
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      return NextResponse.json(
        { error: "Supabase environment variables missing" },
        { status: 500 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { userId, type, message } = await req.json();

    if (!userId || !type || !message) {
      return NextResponse.json(
        { error: "userId, type, and message are required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        type,
        message,
        read: false,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error("Notification create error:", error);
      return NextResponse.json(
        { error: "Failed to create notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Notification create route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
