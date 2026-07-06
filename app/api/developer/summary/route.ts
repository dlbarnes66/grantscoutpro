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
    const { workspaceId } = await req.json();

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    // Fetch API keys
    const { data: keys, error: keysError } = await supabase
      .from("api_keys")
      .select("id, label, api_key, active, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (keysError) {
      console.error("Developer summary: API keys error:", keysError);
    }

    // Fetch recent usage logs
    const { data: logs, error: logsError } = await supabase
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
      .limit(50);

    if (logsError) {
      console.error("Developer summary: usage logs error:", logsError);
    }

    // Developer settings (placeholder for future features)
    const developerSettings = {
      rateLimit: {
        perMinute: 60,
        perHour: 1000,
        perDay: 5000,
      },
      usageAnalyticsEnabled: true,
      apiKeysEnabled: true,
    };

    return NextResponse.json({
      success: true,
      workspaceId,
      keys: keys || [],
      logs: logs || [],
      developerSettings,
      summaryGeneratedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Developer summary route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
