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
    const { workspaceId, limit = 100 } = await req.json();

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    // Fetch usage logs
    const { data, error } = await supabase
      .from("api_usage_logs")
      .select(
        `
        id,
        endpoint,
        success,
        response_time_ms,
        payload_bytes,
        created_at,
        api_keys (
          id,
          label
        )
      `
      )
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("API usage list error:", error);
      return NextResponse.json(
        { error: "Failed to fetch API usage logs" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      logs: data || [],
    });
  } catch (err: any) {
    console.error("API usage list route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
