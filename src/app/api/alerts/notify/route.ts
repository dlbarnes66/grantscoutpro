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

    // Initialize Supabase ONLY after env vars are confirmed
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { workspaceId, message } = await req.json();

    if (!workspaceId || !message) {
      return NextResponse.json(
        { error: "workspaceId and message are required" },
        { status: 400 }
      );
    }

    // Insert alert notification
    const { data, error } = await supabase
      .from("alerts")
      .insert({
        workspace_id: workspaceId,
        message,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error("Alert notify error:", error);
      return NextResponse.json(
        { error: "Failed to create alert" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      alert: data
    });
  } catch (err: any) {
    console.error("Alert notify route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
