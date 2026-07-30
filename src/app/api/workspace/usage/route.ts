export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";




export async function GET(req: Request) {
  try {
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

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("workspace_usage")
      .select("*")
      .eq("workspace_id", workspaceId)
      .single();

    if (error) {
      console.error("Workspace usage error:", error);
      return NextResponse.json(
        { error: "Failed to load workspace usage" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      usage: data
    });
  } catch (err: any) {
    console.error("Workspace usage route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
