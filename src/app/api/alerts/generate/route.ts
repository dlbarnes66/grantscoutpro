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

    const { workspaceId, content } = await req.json();

    if (!workspaceId || !content) {
      return NextResponse.json(
        { error: "workspaceId and content are required" },
        { status: 400 }
      );
    }

    // Fetch workspace context
    const { data: workspace, error: workspaceError } = await supabase
      .from("workspaces")
      .select("*")
      .eq("id", workspaceId)
      .single();

    if (workspaceError) {
      console.error("Alert generate workspace error:", workspaceError);
      return NextResponse.json(
        { error: "Failed to load workspace" },
        { status: 500 }
      );
    }

    // Insert generated alert
    const { data, error } = await supabase
      .from("alerts")
      .insert({
        workspace_id: workspaceId,
        message: content,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error("Alert generate error:", error);
      return NextResponse.json(
        { error: "Failed to generate alert" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      alert: data
    });
  } catch (err: any) {
    console.error("Alert generate route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
